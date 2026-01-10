
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Theme, ResultItem, AppLanguage, GenerationMode } from './types';
import { THEMES, STYLES, TRANSLATIONS, MODEL_OPTIONS } from './constants';
import { Icons } from './components/Icons';
import { generateImageWithGemini, testGeminiConnection } from './services/geminiService';
import { ProfilePage } from './components/ProfilePage';
import { SubscribePage, PaymentSuccessPage, PaymentCancelPage } from './components/SubscribePage';

// --- Global UI Components ---

const LoadingScreen = () => (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent opacity-50"></div>
        <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="w-16 h-16 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-1">
                <p className="text-white font-mono font-bold tracking-[0.2em] text-xs">SYSTEM BOOT</p>
                <p className="text-zinc-500 text-[10px] font-mono">Initializing Nano Banana OS...</p>
            </div>
        </div>
    </div>
);

const ConfigWarning = () => (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full space-y-6 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl">⚡️</div>
            <div className="space-y-2">
                <h1 className="text-xl font-bold text-white">Environment Error</h1>
                <p className="text-zinc-400 text-sm">Application keys are missing.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg text-left font-mono text-[10px] border border-white/5 text-zinc-500">
                <p className="text-red-400 mb-2 font-bold">MISSING_VARS:</p>
                NEXT_PUBLIC_SUPABASE_URL<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY
            </div>
            <a href="https://supabase.com/dashboard" target="_blank" className="block w-full py-3 bg-white text-black font-bold rounded-lg text-sm hover:bg-zinc-200 transition-colors">
                Open Console
            </a>
        </div>
    </div>
);

// --- Auth Components ---

const AuthLayout = ({ children, title }: { children?: React.ReactNode, title: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-md animate-slide-up">
                <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(234,179,8,0.4)] rotate-3">🍌</div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                        <p className="text-zinc-500 font-medium text-xs tracking-widest uppercase">Nano Banana Studio</p>
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
    
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Studio Login">
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input 
                    type="email" placeholder="Email" required
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none transition-all"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" placeholder="Password" required
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg shadow-white/5 hover:bg-zinc-200 transition-all active:scale-95 flex justify-center items-center"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Enter Studio'}
                </button>
            </form>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <p className="text-center text-sm text-zinc-500">
                New here? <Link to="/signup" className="text-white hover:underline decoration-yellow-500">Create Account</Link>
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
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { emailRedirectTo: window.location.origin }
            });
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
            <AuthLayout title="Verify Email">
                <div className="text-center space-y-4">
                    <p className="text-zinc-300">Verification link sent to your inbox.</p>
                    <Link to="/login" className="block w-full py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/20">Return to Login</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Join Studio">
            <form onSubmit={handleSignup} className="space-y-4">
                <input 
                    type="email" placeholder="Email" required
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-all"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" placeholder="Password (min 6 chars)" required minLength={6}
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Create ID'}
                </button>
            </form>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <p className="text-center text-sm text-zinc-500">
                Have account? <Link to="/login" className="text-white hover:underline decoration-yellow-500">Login</Link>
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
    const [apiKey, setApiKey] = useState<string>(localStorage.getItem('custom_api_key') || '123456');
    const [baseUrl, setBaseUrl] = useState<string>(localStorage.getItem('custom_base_url') || 'https://proxy.flydao.top/v1');
    
    // Test connection state
    const [isTesting, setIsTesting] = useState(false);
    const [testLogs, setTestLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    
    const theme = THEMES[currentTheme] || THEMES.banana;
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [testLogs]);

    const handleSaveSettings = () => {
        localStorage.setItem('api_model', model);
        localStorage.setItem('custom_api_key', apiKey);
        localStorage.setItem('custom_base_url', baseUrl);
        setShowSettings(false);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Ping: ${baseUrl}`]);
        try {
            const config = { apiKey, baseUrl };
            const result = await testGeminiConnection(config, model);
            setTestLogs(prev => [...prev, `✅ ${result}`]);
        } catch (err: any) {
            setTestLogs(prev => [...prev, `❌ ${err.message}`]);
        } finally {
            setIsTesting(false);
        }
    };

    const handleLogout = async () => supabase.auth.signOut();

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
        
        // Mobile scroll to results
        if (window.innerWidth < 768) {
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }

        const config = { apiKey, baseUrl };

        await Promise.all(itemsToGen.map(async (item) => {
            try {
                const url = await generateImageWithGemini(item.prompt, sourceImage, model, config);
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
        <div className={`min-h-screen text-zinc-100 flex flex-col md:flex-row relative z-10 overflow-hidden`}>
            
            {/* --- Left Panel: Controls (Glass Sidebar on Desktop) --- */}
            <aside className="w-full md:w-[480px] md:h-screen md:sticky md:top-0 p-6 flex flex-col gap-6 md:border-r border-white/5 bg-black/20 backdrop-blur-md overflow-y-auto no-scrollbar z-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link to="/profile" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black text-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:scale-105 transition-transform">🍌</div>
                        <div>
                            <h1 className="font-bold text-lg leading-none tracking-tight">Nano Banana</h1>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{user.email.split('@')[0]}</span>
                        </div>
                    </Link>
                    <div className="flex gap-2">
                        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold">ZH/EN</button>
                        <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><Icons.Settings className="w-5 h-5" /></button>
                        <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><Icons.X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Upload Area */}
                <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`relative group cursor-pointer aspect-[3/2] rounded-2xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center transition-all hover:bg-white/10 hover:border-yellow-500/50 overflow-hidden`}
                >
                    {sourceImage ? (
                        <>
                            <img src={sourceImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Source" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-black/60 backdrop-blur rounded-lg text-xs font-bold border border-white/10">{t('changePhoto')}</span>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-yellow-400 transition-colors">
                                <Icons.Camera className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-zinc-400 text-sm">{t('uploadTitle')}</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Mode Selector */}
                <div className="p-1 bg-white/5 rounded-xl flex gap-1 border border-white/5">
                    <button onClick={() => setGenerationMode('preset')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${generationMode === 'preset' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><Icons.Magic className="w-4 h-4"/>{t('modePreset')}</button>
                    <button onClick={() => setGenerationMode('custom')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${generationMode === 'custom' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><Icons.PenTool className="w-4 h-4"/>{t('modeCustom')}</button>
                </div>

                {generationMode === 'custom' && (
                    <div className="animate-fade-in">
                        <textarea 
                            value={customPrompt} 
                            onChange={(e) => setCustomPrompt(e.target.value)} 
                            placeholder={t('customPlaceholder')} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-yellow-500/50 text-sm leading-relaxed resize-none h-32 placeholder-zinc-700"
                        ></textarea>
                    </div>
                )}

                {/* Generate Button */}
                <button 
                    onClick={handleGenerate} 
                    disabled={isGlobalGenerating || !sourceImage} 
                    className={`w-full py-4 rounded-xl font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2`}
                >
                    {isGlobalGenerating ? (
                        <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> {t('designing')}</>
                    ) : (
                        <>{t('makeMagic')}</>
                    )}
                </button>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}
            </aside>

            {/* --- Right Panel: Results Gallery --- */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto min-h-screen">
                <div ref={resultsRef} className="grid gap-8 grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto">
                    {/* Placeholder State */}
                    {results.length === 0 && !isGlobalGenerating && (
                        <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-zinc-600 space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
                            <Icons.Magic className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-mono tracking-widest uppercase">Ready to Create</p>
                        </div>
                    )}

                    {results.map(item => (
                        <div key={item.id} className={`glass-card rounded-3xl overflow-hidden p-2 group`}>
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <span className="text-lg">{item.emoji}</span>
                                    <span>{item.title}</span>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-600 bg-black/20 px-2 py-1 rounded">
                                    {model.includes('pro') ? 'PRO' : 'FAST'}
                                </div>
                            </div>
                            <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/50`}>
                                {item.status === 'loading' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="space-y-4 text-center">
                                            <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"/>
                                            <p className="text-xs text-yellow-500 font-mono animate-pulse">{t('rendering')}</p>
                                        </div>
                                    </div>
                                )}
                                {item.status === 'success' && (
                                    <div className="relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500">
                                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <a href={item.imageUrl} download={`nano-banana-${item.title}.png`} className="w-full py-3 bg-white text-black text-xs font-bold rounded-lg text-center hover:bg-yellow-400 transition-colors">
                                                {t('save')}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {item.status === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 space-y-2 p-4 text-center">
                                        <Icons.X className="w-8 h-8" />
                                        <span className="text-xs font-mono uppercase">{t('failed')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Settings Modal (Simplified for XML) */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
                    <div className="glass-panel w-full max-w-md rounded-3xl p-6 space-y-6 relative">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">{t('settings')}</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full"><Icons.X /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Model</label>
                                <select value={model} onChange={e => setModel(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm focus:border-yellow-500/50 outline-none text-white">
                                    {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">API Key</label>
                                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm focus:border-yellow-500/50 outline-none text-white font-mono" />
                            </div>
                            <button onClick={handleTestConnection} disabled={isTesting} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-bold hover:bg-white/10">
                                {isTesting ? 'Pinging...' : t('testConnection')}
                            </button>
                            {testLogs.length > 0 && (
                                <div className="h-32 bg-black rounded-lg p-3 overflow-y-auto font-mono text-[10px] text-green-400 border border-white/5">
                                    {testLogs.map((log, i) => <div key={i}>{log}</div>)}
                                    <div ref={logsEndRef} />
                                </div>
                            )}
                        </div>
                        <button onClick={handleSaveSettings} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-yellow-400 transition-colors">{t('saveChanges')}</button>
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
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    if (!isSupabaseConfigured) return <ConfigWarning />;
    if (loading) return <LoadingScreen />;

    return (
        <Routes>
            <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
            <Route path="/dashboard" element={session ? <AIPhotoStudio user={session.user} /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={session ? <ProfilePage user={session.user} /> : <Navigate to="/login" replace />} />
            <Route path="/subscribe" element={session ? <SubscribePage user={session.user} /> : <Navigate to="/login" replace />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;
