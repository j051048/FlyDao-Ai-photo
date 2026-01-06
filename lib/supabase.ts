import { createClient } from '@supabase/supabase-js';

// Adhering to Vercel/Next.js standards for client-side environment variables.
// Prioritize NEXT_PUBLIC_ prefix, but fallback to standard names for compatibility with other environments.
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// User must provide valid Supabase credentials via environment variables
const defaultUrl = ''; 
const defaultKey = '';

const supabaseUrl = (envUrl && envUrl.length > 0) ? envUrl : defaultUrl;
const supabaseAnonKey = (envKey && envKey.length > 0) ? envKey : defaultKey;

// Validate configuration strictly before attempting to create client
const isValidConfig = 
    supabaseUrl && 
    supabaseUrl.length > 0 && 
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey && 
    supabaseAnonKey.length > 0;

export const isSupabaseConfigured = !!isValidConfig;

// Create client safely. 
// If configuration is invalid, we create a dummy client to prevent "Uncaught Error" during module import.
// The App component will check `isSupabaseConfigured` and show the ConfigWarning screen if needed.
export const supabase = isValidConfig 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');