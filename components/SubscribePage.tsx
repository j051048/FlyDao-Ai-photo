
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
    const [lang, setLang] = useState<AppLanguage>('zh');
    
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    const handleSubscribe = async () => {
        setLoading(true);
        setError('');
        try {
            await startSubscriptionCheckout();
            // User will be redirected, so we might not reach here
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Payment initialization failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FEF9C3] p-4 flex items-center justify-center">
            <div className="w-full max-w-lg animate-pop">
                <div className="nano-glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center">
                    
                    {/* Header */}
                    <div className="relative flex items-center mb-6">
                        <button 
                            onClick={() => navigate('/profile')} 
                            className="p-2 rounded-full hover:bg-white/50 transition-colors text-stone-700"
                        >
                            <Icons.ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-2 mb-8">
                        <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg rotate-6 mb-4">🚀</div>
                        <h1 className="text-3xl font-black text-stone-800 tracking-tight">{t('subscribeTitle')}</h1>
                        <p className="text-stone-500 font-medium">{t('subscribeSubtitle')}</p>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white/60 rounded-3xl p-6 border-2 border-yellow-400/50 shadow-lg mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-xl text-stone-900">POPULAR</div>
                        
                        <div className="flex items-baseline justify-center gap-1 mb-6 mt-2">
                            <span className="text-5xl font-black text-stone-800">$10</span>
                            <span className="text-stone-500 font-bold">{t('perMonth')}</span>
                        </div>

                        <ul className="space-y-4 text-left mb-8">
                            {[t('feature1'), t('feature2'), t('feature3'), t('feature4')].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-400 text-white flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <span className="font-bold text-stone-700 text-sm">{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('subscribeBtn')}
                        </button>
                        
                        {error && <p className="text-red-500 font-bold text-xs mt-4 bg-red-50 p-2 rounded-lg">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS['zh'][key]; // Default to ZH or use context

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md animate-pop">
                <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-green-900">{t('paymentSuccessTitle')}</h1>
                    <p className="text-green-700 font-medium mt-2">{t('paymentSuccessDesc')}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-white text-green-900 font-bold rounded-xl shadow-lg border border-green-200">
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
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md animate-pop">
                <div className="text-6xl">🤔</div>
                <div>
                    <h1 className="text-3xl font-black text-stone-800">{t('paymentCancelTitle')}</h1>
                    <p className="text-stone-500 font-medium mt-2">{t('paymentCancelDesc')}</p>
                </div>
                <button onClick={() => navigate('/subscribe')} className="px-8 py-3 bg-white text-stone-800 font-bold rounded-xl shadow-lg border border-stone-200">
                    {t('tryAgain')}
                </button>
            </div>
        </div>
    );
};
