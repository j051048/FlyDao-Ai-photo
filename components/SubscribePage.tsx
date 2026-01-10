
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../constants';
import { AppLanguage } from '../types';
import { Icons } from './Icons';
import { startSubscriptionCheckout } from '../services/paymentService';

interface SubscribePageProps {
    user: any;
}

export const SubscribePage: React.FC<SubscribePageProps> = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [lang] = useState<AppLanguage>('zh'); // Inherit from context in real app
    
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    const handleSubscribe = async () => {
        setLoading(true);
        setError('');
        try {
            await startSubscriptionCheckout();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Initialization failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in relative z-10">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
                
                {/* Left Side: Value Prop */}
                <div className="space-y-8 text-left">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group"
                    >
                        <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {t('backToDash')}
                    </button>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 leading-tight pb-2">
                            {t('subscribeTitle')}
                        </h1>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                            {t('subscribeSubtitle')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[t('feature1'), t('feature2'), t('feature3'), t('feature4')].map((feat, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/50 transition-all">
                                    <Icons.Check className="w-4 h-4" />
                                </div>
                                <span className="text-zinc-200 font-medium tracking-wide">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Pricing Card */}
                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-[2rem] blur opacity-20"></div>
                    
                    <div className="glass-panel rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col gap-8">
                        <div className="absolute top-0 right-0 bg-yellow-500/20 border-l border-b border-white/10 text-yellow-300 text-[10px] font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-widest">
                            Most Popular
                        </div>

                        <div className="space-y-1">
                            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Pro Plan</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-mono font-bold text-white">$10</span>
                                <span className="text-zinc-500 font-medium">{t('perMonth')}</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/10"></div>

                        <button 
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg shadow-white/10 hover:shadow-yellow-500/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-slide-up opacity-0 group-hover:opacity-100"></div>
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> 
                            ) : (
                                <>
                                    <span>{t('subscribeBtn')}</span>
                                    <Icons.Diamond className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-zinc-600 text-xs">
                            Secure payment via Stripe. Cancel anytime.
                        </p>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS['zh'][key];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="glass-panel p-10 rounded-3xl text-center space-y-6 max-w-md w-full animate-pop">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <Icons.Check className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">{t('paymentSuccessTitle')}</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">{t('paymentSuccessDesc')}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                    {t('returnHome')}
                </button>
            </div>
        </div>
    );
};

export const PaymentCancelPage = () => {
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS['zh'][key];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="glass-panel p-10 rounded-3xl text-center space-y-6 max-w-md w-full animate-pop">
                <div className="text-5xl grayscale opacity-50">🤔</div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">{t('paymentCancelTitle')}</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">{t('paymentCancelDesc')}</p>
                </div>
                <button onClick={() => navigate('/subscribe')} className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                    {t('tryAgain')}
                </button>
            </div>
        </div>
    );
};
