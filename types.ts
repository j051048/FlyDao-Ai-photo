export interface Theme {
    id: string;
    name: string;
    emoji: string;
    bg: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
    border: string;
    gradient: string;
    buttonShadow: string;
    cardBg: string;
}

export interface StyleItem {
    id: string;
    title: string;
    emoji: string;
    prompt: string;
}

export interface ResultItem extends StyleItem {
    status: 'loading' | 'success' | 'error';
    imageUrl?: string;
}

export interface Config {
    provider: 'official' | 'thirdparty';
    baseUrl: string;
    apiKey: string;
    model: string;
    googleKey?: string; // Legacy
}

export type AppLanguage = 'zh' | 'en';
export type GenerationMode = 'preset' | 'custom';

export interface Translation {
    appTitle: string;
    subtitle: string;
    settings: string;
    uploadTitle: string;
    uploadDesc: string;
    changePhoto: string;
    makeMagic: string;
    designing: string;
    save: string;
    tryAgain: string;
    failed: string;
    rendering: string;
    provider: string;
    official: string;
    thirdParty: string;
    model: string;
    saveChanges: string;
    apiKeyPlaceholder: string;
    googleKeyPlaceholder: string;
    baseUrlPlaceholder: string;
    modePreset: string;
    modeCustom: string;
    customPlaceholder: string;
    customTitle: string;
    promptLabel: string;
    customGenBtn: string;
    errorTooLarge: string;
    errorNoKey: string;
    errorGenFailed: string;
}