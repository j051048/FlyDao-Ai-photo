
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

export interface HistoryItem {
    id: string;
    timestamp: number;
    imageUrl: string;
    prompt: string;
    styleTitle: string;
    emoji: string;
}

export interface Config {
    provider: 'official' | 'thirdparty';
    baseUrl: string;
    apiKey: string;
    model: string;
    googleKey?: string; // Legacy
}

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    bio: string | null;
    avatar_url: string | null;
    subscription_status: 'free' | 'pro';
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
    testConnection: string;
    testing: string;
    testSuccess: string;
    testFailed: string;
    // Profile
    profileTitle: string;
    fullName: string;
    bio: string;
    bioPlaceholder: string;
    email: string;
    subscription: string;
    planFree: string;
    planPro: string;
    saveProfile: string;
    backToDash: string;
    profileSaved: string;
    changeAvatar: string;
    uploading: string;
    errorAvatarSize: string;
    errorUploadFailed: string;
    // Subscription
    upgradeToPro: string;
    subscribeTitle: string;
    subscribeSubtitle: string;
    perMonth: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    subscribeBtn: string;
    restorePurchase: string;
    paymentSuccessTitle: string;
    paymentSuccessDesc: string;
    returnHome: string;
    paymentCancelTitle: string;
    paymentCancelDesc: string;
    // Edit & Actions
    retry: string;
    edit: string;
    editTitle: string;
    editPlaceholder: string;
    applyEdit: string;
    cancel: string;
    // History
    history: string;
    historyEmpty: string;
    clearHistory: string;
}
