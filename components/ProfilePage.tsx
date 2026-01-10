
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TRANSLATIONS } from '../constants';
import { AppLanguage, Profile } from '../types';
import { Icons } from './Icons';

interface ProfilePageProps {
    user: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [lang] = useState<AppLanguage>('zh'); 
    const [message, setMessage] = useState('');
    
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setProfile(data);
                    setFullName(data.full_name || '');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatar_url);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = { id: user.id, email: user.email, full_name: fullName, bio: bio, updated_at: new Date() };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            setProfile({ ...updates, avatar_url: avatarUrl, subscription_status: profile?.subscription_status || 'free' } as Profile);
            setMessage(t('profileSaved'));
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        setUploadingAvatar(true);
        try {
            const filePath = `avatar-${user.id}-${Math.random()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('avatars').upload(filePath, file);
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await supabase.from('profiles').upsert({ id: user.id, avatar_url: data.publicUrl });
            setAvatarUrl(data.publicUrl);
        } catch (error) {
            alert(t('errorUploadFailed'));
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;

    const isPro = profile?.subscription_status === 'pro';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-lg animate-pop">
                <div className="glass-panel rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            <Icons.ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="font-bold text-white text-lg tracking-wide uppercase">{t('profileTitle')}</h1>
                        <div className="w-8" />
                    </div>

                    <div className="space-y-8">
                        {/* Avatar & Status */}
                        <div className="flex flex-col items-center gap-4">
                            <div 
                                onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                                className={`relative group cursor-pointer w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-2 overflow-hidden ${isPro ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-white/10'}`}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">{fullName ? fullName[0] : user.email[0]}</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Icons.Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                            
                            <div className="flex flex-col items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isPro ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/5 text-zinc-500 border-white/10'}`}>
                                    {isPro ? t('planPro') : t('planFree')}
                                </div>
                                {!isPro && (
                                    <button onClick={() => navigate('/subscribe')} className="text-xs text-yellow-400 hover:text-yellow-300 font-medium underline underline-offset-4 decoration-yellow-400/30">
                                        {t('upgradeToPro')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">{t('fullName')}</label>
                                <input 
                                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-yellow-500/50 outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">{t('bio')}</label>
                                <textarea 
                                    value={bio} onChange={(e) => setBio(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-yellow-500/50 outline-none transition-all resize-none h-24"
                                    placeholder={t('bioPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2 opacity-50">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">{t('email')}</label>
                                <div className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-zinc-400 text-sm font-mono">{user.email}</div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-zinc-200 transition-all active:scale-95 flex justify-center items-center mt-4"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : t('saveProfile')}
                        </button>
                        
                        {message && <div className="text-center text-xs text-green-400 font-medium animate-fade-in">{message}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
