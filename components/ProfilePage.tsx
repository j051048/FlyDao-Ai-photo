
import React, { useState, useEffect } from 'react';
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
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [lang, setLang] = useState<AppLanguage>('zh'); // You might want to pull this from a global context or storage
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    setProfile(data);
                    setFullName(data.full_name || '');
                    setBio(data.bio || '');
                } else {
                    // Initialize empty state if no profile exists yet
                    setFullName('');
                    setBio('');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user.id]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const updates = {
                id: user.id,
                email: user.email, // Ensure email is synced
                full_name: fullName,
                bio: bio,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            
            setProfile({ 
                ...updates, 
                subscription_status: profile?.subscription_status || 'free' 
            } as Profile);
            
            setMessage(t('profileSaved'));
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FEF9C3] flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEF9C3] p-4 flex items-center justify-center">
            <div className="w-full max-w-lg animate-pop">
                <div className="nano-glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 -translate-y-10 translate-x-10 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 translate-y-10 -translate-x-10 animate-blob animation-delay-2000"></div>

                    {/* Header */}
                    <div className="relative flex items-center mb-8">
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="p-2 rounded-full hover:bg-white/50 transition-colors text-stone-700"
                        >
                            <Icons.ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="flex-1 text-center text-2xl font-black text-stone-800 tracking-tight mr-10">
                            {t('profileTitle')}
                        </h1>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white">
                                {fullName ? fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div className="text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                    profile?.subscription_status === 'pro' 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}>
                                    {profile?.subscription_status === 'pro' ? t('planPro') : t('planFree')}
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-stone-500">
                                    {t('email')}
                                </label>
                                <input 
                                    type="text" 
                                    value={user.email} 
                                    disabled 
                                    className="w-full px-5 py-4 rounded-2xl bg-stone-100/50 border-2 border-transparent text-stone-500 font-medium cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-stone-500">
                                    {t('fullName')}
                                </label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-white/80 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-all font-medium text-stone-800"
                                    placeholder={user.email.split('@')[0]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-stone-500">
                                    {t('bio')}
                                </label>
                                <textarea 
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-white/80 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-all font-medium text-stone-800 resize-none min-h-[100px]"
                                    placeholder={t('bioPlaceholder')}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-stone-800 font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center mt-4"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" /> : t('saveProfile')}
                        </button>
                        
                        {message && (
                            <div className="text-center text-sm font-bold text-green-600 animate-fade-in">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
