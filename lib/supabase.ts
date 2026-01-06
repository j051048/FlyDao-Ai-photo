import { createClient } from '@supabase/supabase-js';

// Use process.env if available (from build time or shim), otherwise fallback to hardcoded strings
// This dual-check ensures it works in both local development and bundled environments
const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

// User must provide valid Supabase credentials via environment variables (index.html shim or build env)
// We remove invalid hardcoded placeholders to allow the "ConfigWarning" screen to trigger correctly.
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