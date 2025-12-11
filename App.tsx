import React, { useState, useRef } from 'react';
import { Theme, ResultItem, Config, AppLanguage, GenerationMode } from './types';
import { THEMES, STYLES, TRANSLATIONS, MODEL_OPTIONS } from './constants';
import { Icons } from './components/Icons';
import { generateImageWithGemini } from './services/geminiService';

// Helper for safe storage access
const getStorageItem = (key: string) => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const AIPhotoStudio = () => {
    // State
    const [currentTheme, setCurrentTheme] = useState<string>('banana');
    const [lang, setLang] = useState<AppLanguage>('zh');
    const [generationMode, setGenerationMode] = useState<GenerationMode>('preset');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [isGlobalGenerating, setIsGlobalGenerating] = useState<boolean>(false);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [error, setError] = useState<string>('');
    
    // Settings State
    const [config, setConfig] = useState<Config>({
        provider: (getStorageItem('api_provider') as 'official' | 'thirdparty') || 'official',
        baseUrl: getStorageItem('api_base_url') || '',
        apiKey: getStorageItem('api_key') || '',
        model: getStorageItem('api_model') || 'gemini-2.5-flash-image'
    });
    const [showSettings, setShowSettings] = useState<boolean>(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    
    const theme = THEMES[currentTheme] || THEMES.banana;
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    const saveConfig = (newConfig: Config) => {
        setConfig(newConfig);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('api_provider', newConfig.provider);
            localStorage.setItem('api_base_url', newConfig.baseUrl);
            localStorage.setItem('api_key', newConfig.apiKey);
            localStorage.setItem('api_model', newConfig.model);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) { 
                setError(t('errorTooLarge'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setSourceImage(event.target.result as string);
                    setResults([]); // Clear previous
                    setError('');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const generateImageAPI = async (prompt: string, sourceImg: string): Promise<string> => {
        const provider = config.provider;
        
        let finalPrompt = prompt;
        // Check if we need to append constraint
        if (!finalPrompt.includes('IDENTITY CONSTRAINT')) {
            finalPrompt += " \n\n[IDENTITY CONSTRAINT]: Strictly maintain the facial identity, bone structure, and features of the person in the provided image. High fidelity face preservation.";
        }

        if (provider === 'official') {
            // Use Gemini SDK
            return await generateImageWithGemini(finalPrompt, sourceImg);
        } else {
            // Third Party / Proxy Implementation (Fetch)
            if (!config.apiKey) throw new Error(t('errorNoKey'));
            let baseUrl = config.baseUrl.replace(/\/$/, '');
            let endpoint = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
            if (!baseUrl.includes('/v1') && !baseUrl.includes('/chat')) endpoint = `${baseUrl}/v1/chat/completions`; 

            const payload = {
                model: config.model,
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: finalPrompt },
                        { type: "image_url", image_url: { url: sourceImg } }
                    ]
                }],
                stream: false
            };
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error(t('errorGenFailed'));
            const data = await res.json();
            
            if (data.data && data.data[0] && data.data[0].url) return data.data[0].url;
            const content = data.choices?.[0]?.message?.content || "";
            const urlMatch = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i) || content.match(/\!\[.*?\]\((.*?)\)/);
            if (urlMatch) return urlMatch[1] || urlMatch[0];
            
            throw new Error(t('errorGenFailed'));
        }
    };

    const handleGenerate = async () => {
        if (!sourceImage) return;
        setIsGlobalGenerating(true);
        setError('');
        
        // Determine items to generate
        let itemsToGen: ResultItem[] = [];
        if (generationMode === 'custom') {
            if (!customPrompt.trim()) {
                setError(lang === 'zh' ? '请输入提示词' : 'Please enter a prompt');
                setIsGlobalGenerating(false);
                return;
            }
            itemsToGen = [{
                id: 'custom-' + Date.now(),
                title: t('customTitle'),
                emoji: '🎨',
                prompt: customPrompt,
                status: 'loading'
            }];
        } else {
            itemsToGen = STYLES.map(s => ({ 
                ...s, 
                status: 'loading' as const, 
                imageUrl: undefined 
            }));
        }

        // Set Initial State
        setResults(itemsToGen);

        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        // Execute
        const promises = itemsToGen.map(async (item, idx) => {
            // Stagger preset generations for visual effect
            if (generationMode === 'preset') await new Promise(r => setTimeout(r, idx * 800));
            
            try {
                const url = await generateImageAPI(item.prompt, sourceImage);
                setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'success', imageUrl: url } : r));
            } catch (e: any) {
                setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'error' } : r));
                if(idx === 0) setError(e.message || t('errorGenFailed'));
            }
        });

        await Promise.all(promises);
        setIsGlobalGenerating(false);
    };

    const handleRegenerateSingle = async (itemToRegen: ResultItem) => {
        setResults(prev => prev.map(r => r.id === itemToRegen.id ? { ...r, status: 'loading' } : r));
        try {
            const url = await generateImageAPI(itemToRegen.prompt, sourceImage!);
            setResults(prev => prev.map(r => r.id === itemToRegen.id ? { ...r, status: 'success', imageUrl: url } : r));
        } catch (e: any) {
            setResults(prev => prev.map(r => r.id === itemToRegen.id ? { ...r, status: 'error' } : r));
            setError(e.message || t('errorGenFailed'));
        }
    };

    const handleDownload = (imageUrl: string, filename: string) => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ThemeSwitcher = () => (
        <div className="flex gap-2 p-2 bg-white/50 backdrop-blur rounded-2xl border border-white/50 shadow-sm mb-6 w-fit mx-auto">
            {Object.values(THEMES).map(t => (
                <button 
                    key={t.id}
                    onClick={() => setCurrentTheme(t.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${currentTheme === t.id ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50 opacity-70 grayscale hover:grayscale-0'}`}
                    title={t.name}
                >
                    {t.emoji}
                </button>
            ))}
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-700 ${theme.bg} ${theme.text} pb-20 selection:bg-amber-200 selection:text-amber-900`}>
            
            {/* Navbar */}
            <nav className="sticky top-0 z-40 px-6 py-4">
                <div className="nano-glass rounded-full px-6 py-3 flex items-center justify-between shadow-lg shadow-black/5 max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center text-white text-xl shadow-inner`}>
                            {theme.emoji}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none tracking-tight">{t('appTitle')}</h1>
                            <span className={`text-[10px] font-bold opacity-60 uppercase tracking-widest`}>{t('subtitle')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                            className="px-3 py-1.5 rounded-full bg-white/50 hover:bg-white text-xs font-bold border border-white/50 transition-colors"
                        >
                            {lang === 'zh' ? 'EN' : '中'}
                        </button>
                        <button 
                            onClick={() => setShowSettings(true)}
                            className={`p-2.5 rounded-full hover:bg-black/5 transition-colors`}
                        >
                            <Icons.Settings className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 pt-8">
                
                <ThemeSwitcher />

                {/* Hero / Upload */}
                <div className="text-center space-y-8 mb-12 animate-fade-in">
                    <div className="space-y-2">
                        <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${theme.accent}`}>
                            Create Your <br/>
                            <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>Digital Vibe</span>
                        </h2>
                        <p className="opacity-60 font-medium">✨ Upload one photo, get infinite styles ✨</p>
                    </div>

                    {/* Upload Card */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative group cursor-pointer transition-all duration-500
                            aspect-[4/3] md:aspect-[2/1] rounded-[2.5rem]
                            border-4 border-dashed ${theme.border} bg-white/40
                            hover:bg-white/60 hover:scale-[1.01] hover:border-double
                            flex flex-col items-center justify-center overflow-hidden
                        `}
                    >
                        {sourceImage ? (
                            <>
                                <img src={sourceImage} alt="Source" className="w-full h-full object-contain p-4 opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                                        <Icons.Refresh className="w-4 h-4" /> {t('changePhoto')}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 pointer-events-none">
                                <div className={`w-20 h-20 mx-auto rounded-3xl ${theme.secondary} flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform duration-300`}>
                                    <Icons.Camera className={`w-10 h-10 ${theme.accent}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-xl">{t('uploadTitle')}</p>
                                    <p className="text-sm opacity-60">{t('uploadDesc')}</p>
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex justify-center w-full">
                        <div className="bg-white/40 p-1.5 rounded-2xl flex gap-1 border border-white/50 w-full max-w-sm">
                            <button
                                onClick={() => setGenerationMode('preset')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${generationMode === 'preset' ? 'bg-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <Icons.Magic className="w-4 h-4" /> {t('modePreset')}
                            </button>
                            <button
                                onClick={() => setGenerationMode('custom')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${generationMode === 'custom' ? 'bg-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <Icons.PenTool className="w-4 h-4" /> {t('modeCustom')}
                            </button>
                        </div>
                    </div>

                     {/* Custom Prompt Input */}
                    {generationMode === 'custom' && (
                        <div className="w-full max-w-xl mx-auto animate-pop text-left bg-white/40 p-4 rounded-3xl border border-white/60">
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 opacity-60">{t('promptLabel')}</label>
                            <textarea 
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder={t('customPlaceholder')}
                                className="w-full bg-white/80 border-2 border-transparent focus:border-white rounded-xl px-4 py-4 focus:outline-none min-h-[100px] text-sm leading-relaxed resize-none shadow-inner"
                            ></textarea>
                        </div>
                    )}

                    {/* Generate Button */}
                    {sourceImage && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGlobalGenerating}
                            className={`
                                w-full py-5 rounded-3xl font-black text-xl text-white tracking-wide
                                shadow-xl ${theme.buttonShadow}
                                bg-gradient-to-r ${theme.gradient}
                                transform transition-all duration-200
                                ${isGlobalGenerating ? 'opacity-80 scale-95 cursor-wait' : 'hover:scale-[1.02] active:scale-95 hover:shadow-2xl'}
                                flex items-center justify-center gap-3
                            `}
                        >
                            {isGlobalGenerating ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"/>
                                    {t('designing')}
                                </>
                            ) : (
                                <>
                                    <Icons.Magic className="w-6 h-6" /> {generationMode === 'preset' ? t('makeMagic') : t('customGenBtn')}
                                </>
                            )}
                        </button>
                    )}

                    {error && (
                        <div className="bg-red-100 text-red-600 px-4 py-3 rounded-2xl font-bold border-2 border-red-200 animate-pop">
                            🚨 {error}
                        </div>
                    )}
                </div>

                {/* Results Grid */}
                <div ref={resultsRef} className="scroll-mt-28">
                    {results.length > 0 && (
                        <div className={`grid gap-6 pb-12 ${results.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {results.map((item) => (
                                <div key={item.id} className={`${theme.cardBg} p-3 rounded-[2rem] shadow-xl shadow-black/5 animate-pop border border-white/60`}>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between px-2 mb-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-xl filter drop-shadow-sm flex-shrink-0">{item.emoji}</span>
                                            <span className="font-bold text-lg truncate">{item.title}</span>
                                        </div>
                                        {/* Top Right Actions */}
                                        {item.status === 'success' && (
                                            <button 
                                                onClick={() => handleRegenerateSingle(item)}
                                                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors flex-shrink-0"
                                                title={t('tryAgain')}
                                            >
                                                <Icons.Refresh className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Image Area */}
                                    <div className={`relative aspect-[3/4] rounded-[1.5rem] overflow-hidden ${theme.secondary} pattern-grid group`}>
                                        {item.status === 'loading' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                <div className={`w-10 h-10 border-4 ${theme.border} border-t-transparent rounded-full animate-spin`}/>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${theme.accent} animate-pulse`}>{t('rendering')}</span>
                                            </div>
                                        )}
                                        
                                        {item.status === 'error' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                <span className="text-4xl mb-2">😵‍💫</span>
                                                <p className="text-xs font-bold opacity-60">{t('failed')}</p>
                                                <button onClick={() => handleRegenerateSingle(item)} className="mt-4 px-4 py-2 bg-white rounded-full text-xs font-bold shadow-sm">{t('tryAgain')}</button>
                                            </div>
                                        )}

                                        {item.status === 'success' && item.imageUrl && (
                                            <>
                                                <img src={item.imageUrl} alt="Result" className="w-full h-full object-cover" />
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                    <div className="flex gap-2 w-full">
                                                        <button 
                                                            onClick={() => handleDownload(item.imageUrl!, `nano-${item.id}.png`)}
                                                            className="flex-1 bg-white text-black py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-stone-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                                        >
                                                            <Icons.Download className="w-4 h-4" /> {t('save')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className={`px-6 py-4 ${theme.secondary} flex justify-between items-center`}>
                            <h3 className={`font-bold text-lg ${theme.accent}`}>{t('settings')} ⚙️</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 bg-white/50 rounded-full hover:bg-white"><Icons.X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Provider Toggle */}
                            <label className="text-xs font-bold uppercase text-stone-400 ml-1">{t('provider')}</label>
                            <div className="flex bg-stone-100 p-1 rounded-xl">
                                <button onClick={() => setConfig({...config, provider: 'official'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${config.provider === 'official' ? 'bg-white shadow-sm text-black' : 'text-stone-400'}`}>{t('official')}</button>
                                <button onClick={() => setConfig({...config, provider: 'thirdparty'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${config.provider === 'thirdparty' ? 'bg-white shadow-sm text-black' : 'text-stone-400'}`}>{t('thirdParty')}</button>
                            </div>

                            {config.provider === 'official' ? (
                                <div className="space-y-2 p-4 bg-stone-50 rounded-xl text-center">
                                   <p className="text-sm text-stone-600 font-medium">Using System Environment API Key</p>
                                   <p className="text-xs text-stone-400">Gemini 2.5 Flash / 3.0 Pro</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase text-stone-400 ml-2">Config</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('baseUrlPlaceholder')}
                                        value={config.baseUrl} 
                                        onChange={e => setConfig({...config, baseUrl: e.target.value})}
                                        className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 font-mono text-sm"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder={t('apiKeyPlaceholder')}
                                        value={config.apiKey} 
                                        onChange={e => setConfig({...config, apiKey: e.target.value})}
                                        className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 font-mono text-sm"
                                    />
                                    
                                    <label className="text-xs font-bold uppercase text-stone-400 ml-2">{t('model')}</label>
                                    <div className="relative">
                                        <select 
                                            value={config.model}
                                            onChange={(e) => setConfig({...config, model: e.target.value})}
                                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 font-mono text-sm appearance-none focus:outline-none"
                                        >
                                            {MODEL_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                            <option value="custom">Custom (Type manually...)</option>
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none opacity-50">▼</div>
                                    </div>
                                    {/* Fallback for custom model typing */}
                                    {config.model === 'custom' && (
                                        <input 
                                            type="text" 
                                            placeholder="Enter Model ID..."
                                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 font-mono text-sm mt-2"
                                            onBlur={(e) => e.target.value && setConfig({...config, model: e.target.value})}
                                        />
                                    )}
                                </div>
                            )}

                            <button 
                                onClick={() => {saveConfig(config); setShowSettings(false);}}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${theme.gradient} mt-4 active:scale-95 transition-transform`}
                            >
                                {t('saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPhotoStudio;