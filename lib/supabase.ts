import { createClient } from '@supabase/supabase-js';

/**
 * 环境变量读取逻辑 (Vercel/Next.js/Vite 兼容版)
 * 必须直接访问 process.env.NEXT_PUBLIC_... 属性，不能使用动态 key (process.env[key])，
 * 否则打包工具在构建时无法执行静态替换，导致部署后变量为 undefined。
 */
const getEnv = () => {
    let url = '';
    let key = '';

    // 1. 优先尝试直接访问 process.env (Vercel / Next.js 构建时替换)
    // 注意：这里必须显式写出完整变量名，不能用变量拼接
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }

    // 2. 尝试 import.meta.env (Vite 构建环境)
    // @ts-ignore
    if (!url && typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
        // @ts-ignore
        key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }

    // 3. 最后尝试 window.process 垫片 (index.html 硬编码注入)
    if (!url && typeof window !== 'undefined' && (window as any).process?.env) {
        url = (window as any).process.env.NEXT_PUBLIC_SUPABASE_URL;
        key = (window as any).process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }

    return { url, key };
};

const { url: envUrl, key: envKey } = getEnv();

// 默认值 (防止崩溃)
const supabaseUrl = envUrl || '';
const supabaseAnonKey = envKey || '';

// 严格校验配置是否有效
const isValidConfig = 
    supabaseUrl && 
    supabaseUrl.length > 0 && 
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey && 
    supabaseAnonKey.length > 0;

export const isSupabaseConfigured = !!isValidConfig;

// 创建 Supabase 客户端
// 如果配置无效，创建一个占位客户端，避免应用启动时直接报错白屏，而是允许 UI 层展示配置提示页
export const supabase = isValidConfig 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');