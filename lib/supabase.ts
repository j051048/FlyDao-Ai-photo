import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, Next.js, Raw HTML Shim)
const getEnvVar = (key: string) => {
    // 1. Try global window shim (Runtime) - This bypasses bundler replacement of "process.env"
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) {
        return (window as any).process.env[key];
    }
    // 2. Try standard process.env (Build time)
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key];
    }
    // 3. Try import.meta.env (Vite)
    try {
        // @ts-ignore
        if (import.meta?.env?.[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) { /* ignore */ }
    
    return '';
};

// Retrieve keys with priority for NEXT_PUBLIC_ prefix
const envUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const envKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

const defaultUrl = ''; 
const defaultKey = '';

const supabaseUrl = (envUrl && envUrl.length > 0) ? envUrl : defaultUrl;
const supabaseAnonKey = (envKey && envKey.length > 0) ? envKey : defaultKey;

// Validate configuration strictly
const isValidConfig = 
    supabaseUrl && 
    supabaseUrl.length > 0 && 
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey && 
    supabaseAnonKey.length > 0;

export const isSupabaseConfigured = !!isValidConfig;

// Create client
export const supabase = isValidConfig 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');