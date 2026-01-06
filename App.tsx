import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Theme, ResultItem, Config, AppLanguage, GenerationMode } from './types';
import { THEMES, STYLES, TRANSLATIONS, MODEL_OPTIONS } from './constants';
import { Icons } from './components/Icons';
import { generateImageWithGemini } from './services/geminiService';

// --- Global UI Components ---

const LoadingScreen = () => (
    <div className="min-h-screen bg-[#FEF9C3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 font-bold animate-pulse text-sm">Nano Banana OS is booting...</p>
        </div>
    </div>
);

const ConfigWarning = () => (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
            <div className="text-5xl">🚧</div>
            <h1 className="text-2xl font-black text-rose-900">环境配置缺失</h1>
            <p className="text-rose-700 font-medium">应用需要 <b>SUPABASE_URL</b> 和 <b>SUPABASE_ANON_KEY</b> 才能运行。</p>
            <div className="p-4 bg-white/50 rounded-2xl text-left font-mono text-xs border border-rose-100 text-stone-600">
                <p className="mb-2 font-bold text-rose-800">如何修复:</p>
                1. 在 index.html 或 Vercel 环境变量中填入 Supabase Key<br/>
                2. 或在 lib/supabase.ts 中配置 defaultUrl/defaultKey
            </div>
            <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" className="inline-block px-6 py-3 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-xl font-bold text-sm transition-colors">
                前往 Supabase 获取 Key &rarr;
            </a>
        </div>
    </div>
);

// --- Auth Components ---

const AuthLayout = ({ children, title }: { children?: React.ReactNode, title: string }) => {
    return (
        <div className="min-h-screen bg-[#FEF9C3] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-pop">
                <div className="nano-glass rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-lg rotate-3 mb-4">🍌</div>
                        <h1 className="text-3xl font-black text-stone-800 tracking-tight">{title}</h1>
                        <p className="text-stone-500 font-medium text-sm">Welcome to Nano Banana OS</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // Navigation handled by AuthStateChange in App component
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) setError(error.message);
    };

    return (
        <AuthLayout title="登入写真馆">
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input 
                    type="email" placeholder="Email" required
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-all font-medium"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" placeholder="Password" required
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-all font-medium"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-stone-800 font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" /> : '登录'}
                </button>
            </form>
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-stone-400 text-xs font-bold uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-stone-200"></div>
            </div>
            <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border-2 border-stone-100 hover:bg-stone-50 text-stone-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Google 登录
            </button>
            {error && <p className="text-red-500 text-xs font-bold text-center mt-2">🚨 {error}</p>}
            <p className="text-center text-sm text-stone-500 font-medium">
                没有账号? <Link to="/signup" className="text-yellow-600 font-bold hover:underline">立即注册</Link>
            </p>
        </AuthLayout>
    );
};

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="注册成功">
                <div className="text-center space-y-4">
                    <p className="text-stone-600 font-medium">请检查您的邮箱以完成验证。</p>
                    <Link to="/login" className="block w-full py-4 bg-yellow-400 text-stone-800 font-bold rounded-2xl">返回登录</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="创建新账号">
            <form onSubmit={handleSignup} className="space-y-4">
                <input 
                    type="email" placeholder="Email" required
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-yellow-400 focus:outline-none font-medium"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" placeholder="Password (min 6 chars)" required minLength={6}
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-yellow-400 focus:outline-none font-medium"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-yellow-400 text-stone-800 font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" /> : '注册'}
                </button>
            </form>
            {error && <p className="text-red-500 text-xs font-bold text-center mt-2">🚨 {error}</p>}
            <p className="text-center text-sm text-stone-500 font-medium">
                已有账号? <Link to="/login" className="text-yellow-600 font-bold hover:underline">去登录</Link>
            </p>
        </AuthLayout>
    );
};

// --- Dashboard ---

const AIPhotoStudio = ({ user }: { user: any }) => {
    const [currentTheme, setCurrentTheme] = useState<string>('banana');
    const [lang, setLang] = useState<AppLanguage>('zh');
    const [generationMode, setGenerationMode] = useState<GenerationMode>('preset');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [isGlobalGenerating, setIsGlobalGenerating] = useState<boolean>(false);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [error, setError] = useState<string>('');
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [model, setModel] = useState<string>(localStorage.getItem('api_model') || 'gemini-2.5-flash-image');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    
    const theme = THEMES[currentTheme] || THEMES.banana;
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Auth state listener in App will handle navigation
        } catch (error) {
            console.error('Error logging out:', error);
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
            reader.onload = (ev) => {
                setSourceImage(ev.target?.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!sourceImage) return;
        setIsGlobalGenerating(true);
        setError('');
        
        const itemsToGen: ResultItem[] = generationMode === 'custom' 
            ? [{ id: 'custom-'+Date.now(), title: t('customTitle'), emoji: '🎨', prompt: customPrompt, status: 'loading' }]
            : STYLES.map(s => ({ ...s, status: 'loading' as const }));
        
        setResults(itemsToGen);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        await Promise.all(itemsToGen.map(async (item) => {
            try {
                // Handle key selection for pro model
                if (model === 'gemini-3-pro-image-preview') {
                    if (!(await (window as any).aistudio?.hasSelectedApiKey())) {
                        await (window as any).aistudio?.openSelectKey();
                    }
                }
                const url = await generateImageWithGemini(item.prompt, sourceImage, model);
                setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'success', imageUrl: url } : r));
            } catch (e: any) {
                console.error(e);
                setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'error' } : r));
                setError(e.message || t('errorGenFailed'));
            }
        }));
        setIsGlobalGenerating(false);
    };

    return (
        <div className={`min-h-screen transition-colors duration-700 ${theme.bg} ${theme.text} pb-20`}>
            <nav className="sticky top-0 z-40 px-6 py-4">
                <div className="nano-glass rounded-full px-6 py-3 flex items-center justify-between shadow-lg max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center text-white text-xl shadow-inner`}>{theme.emoji}</div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg leading-none">{t('appTitle')}</h1>
                            <span className="text-[10px] font-bold opacity-60 uppercase">{user.email}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-3 py-1.5 rounded-full bg-white/50 hover:bg-white text-xs font-bold border border-white/50 transition-colors">{lang === 'zh' ? 'EN' : '中'}</button>
                        <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-full hover:bg-black/5" aria-label="Settings"><Icons.Settings className="w-6 h-6" /></button>
                        <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-red-50 text-red-400" aria-label="Logout"><Icons.X className="w-6 h-6" /></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 pt-8">
                <div className="flex gap-2 p-2 bg-white/50 backdrop-blur rounded-2xl border border-white/50 shadow-sm mb-6 w-fit mx-auto">
                    {Object.values(THEMES).map(t => (
                        <button key={t.id} onClick={() => setCurrentTheme(t.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentTheme === t.id ? 'bg-white shadow-md scale-110' : 'opacity-70 grayscale hover:grayscale-0'}`} aria-label={`Select ${t.name} theme`}>{t.emoji}</button>
                    ))}
                </div>

                <div className="text-center space-y-8 mb-12 animate-fade-in">
                    <div className="space-y-2">
                        <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${theme.accent}`}>Create Your <br/><span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>Digital Vibe</span></h2>
                        <p className="opacity-60 font-medium">{t('subtitle')}</p>
                    </div>

                    <div onClick={() => fileInputRef.current?.click()} className={`relative group cursor-pointer aspect-[4/3] md:aspect-[2/1] rounded-[2.5rem] border-4 border-dashed ${theme.border} bg-white/40 flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-white/60`}>
                        {sourceImage ? <img src={sourceImage} className="w-full h-full object-contain p-4" alt="Uploaded source" /> : <div className="space-y-4"><Icons.Camera className={`w-12 h-12 ${theme.accent} mx-auto`} /><p className="font-bold text-xl">{t('uploadTitle')}</p></div>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="flex justify-center w-full">
                        <div className="bg-white/40 p-1.5 rounded-2xl flex gap-1 border border-white/50 w-full max-w-sm">
                            <button onClick={() => setGenerationMode('preset')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${generationMode === 'preset' ? 'bg-white shadow-md' : 'opacity-60'}`}><Icons.Magic className="w-4 h-4"/>{t('modePreset')}</button>
                            <button onClick={() => setGenerationMode('custom')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${generationMode === 'custom' ? 'bg-white shadow-md' : 'opacity-60'}`}><Icons.PenTool className="w-4 h-4"/>{t('modeCustom')}</button>
                        </div>
                    </div>

                    {generationMode === 'custom' && (
                        <div className="w-full max-w-xl mx-auto animate-pop text-left bg-white/40 p-4 rounded-3xl border border-white/60">
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 opacity-60">{t('promptLabel')}</label>
                            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={t('customPlaceholder')} className="w-full bg-white/80 border-2 border-transparent focus:border-white rounded-xl px-4 py-4 focus:outline-none min-h-[100px] text-sm leading-relaxed resize-none shadow-inner"></textarea>
                        </div>
                    )}

                    <button onClick={handleGenerate} disabled={isGlobalGenerating || !sourceImage} className={`w-full py-5 rounded-3xl font-black text-xl text-white shadow-xl bg-gradient-to-r ${theme.gradient} transform transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed`}>
                        {isGlobalGenerating ? t('designing') : t('makeMagic')}
                    </button>
                    {error && <p className="text-red-500 font-bold bg-white/80 p-2 rounded-xl inline-block shadow-sm">🚨 {error}</p>}
                </div>

                <div ref={resultsRef} className="grid gap-6 pb-12 grid-cols-1 md:grid-cols-2">
                    {results.map(item => (
                        <div key={item.id} className={`${theme.cardBg} p-3 rounded-[2rem] shadow-xl animate-pop border border-white/60`}>
                            <div className="flex items-center justify-between px-2 mb-3">
                                <div className="flex items-center gap-2"><span className="text-xl">{item.emoji}</span><span className="font-bold text-lg">{item.title}</span></div>
                            </div>
                            <div className={`relative aspect-[3/4] rounded-[1.5rem] overflow-hidden ${theme.secondary} pattern-grid`}>
                                {item.status === 'loading' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"/></div>}
                                {item.status === 'success' && <img src={item.imageUrl} className="w-full h-full object-cover" alt={`Generated ${item.title}`} />}
                                {item.status === 'error' && <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs font-bold text-red-400">GENERATION FAILED</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Settings ⚙️</h3><button onClick={() => setShowSettings(false)} className="p-2 bg-stone-100 rounded-full"><Icons.X className="w-5 h-5"/></button></div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-400 uppercase px-1">Selected Model</label>
                            <select value={model} onChange={e => { setModel(e.target.value); localStorage.setItem('api_model', e.target.value); }} className="w-full p-4 rounded-xl bg-stone-50 border-2 border-stone-100 font-bold focus:outline-none focus:border-yellow-400">
                                {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <button onClick={() => setShowSettings(false)} className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${theme.gradient} shadow-lg active:scale-95`}>保存配置</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Immediate check: If config is invalid, stop loading immediately
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); // Stop loading once we know the session state
        }).catch(err => {
            console.error("Session check failed", err);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false); // Ensure loading is stopped when auth state settles
        });

        return () => subscription.unsubscribe();
    }, []);

    // Priority Check: If config is missing, show warning immediately, don't wait for loading
    if (!isSupabaseConfigured) return <ConfigWarning />;
    
    // Normal loading state
    if (loading) return <LoadingScreen />;

    return (
        <Routes>
            <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
            <Route path="/dashboard" element={session ? <AIPhotoStudio user={session.user} /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;