
import { Theme, StyleItem, Translation } from './types';

export const TRANSLATIONS: Record<string, Translation> = {
    zh: {
        appTitle: "AI 写真馆",
        subtitle: "Nano Banana OS",
        settings: "设置",
        uploadTitle: "点击上传照片",
        uploadDesc: "自拍 / 半身照 (最大 8MB)",
        changePhoto: "更换照片",
        makeMagic: "开始魔法生成",
        designing: "正在设计...",
        save: "保存原图",
        tryAgain: "重试",
        failed: "生成失败",
        rendering: "渲染中",
        provider: "接口服务商",
        official: "Google 官方",
        thirdParty: "第三方转发",
        model: "选择模型",
        saveChanges: "保存配置",
        apiKeyPlaceholder: "输入 API Key (默认: 123456)",
        googleKeyPlaceholder: "输入 Google API Key (AIzaSy...)",
        baseUrlPlaceholder: "输入 Base URL (默认: https://proxy.flydao.top)",
        modePreset: "大师预设",
        modeCustom: "自定义风格",
        customPlaceholder: "请描述你想要的风格...\n例如：赛博朋克城市背景，霓虹灯光，未来感机甲，下雨天，电影质感...",
        customTitle: "自定义创作",
        promptLabel: "自定义提示词",
        customGenBtn: "生成自定义写真",
        errorTooLarge: "图片太大了 (>8MB) 🍬",
        errorNoKey: "请先去设置配置 API Key 🔑",
        errorGenFailed: "生成失败了 🥲",
        testConnection: "测试连接",
        testing: "连接测试中...",
        testSuccess: "连接成功！API 有效 ✅",
        testFailed: "连接失败: ",
        // Profile
        profileTitle: "个人档案",
        fullName: "全名",
        bio: "个人简介",
        bioPlaceholder: "写一句话介绍你自己...",
        email: "电子邮箱",
        subscription: "订阅计划",
        planFree: "免费版",
        planPro: "专业版",
        saveProfile: "保存资料",
        backToDash: "返回创作",
        profileSaved: "资料已更新 ✨",
        changeAvatar: "更换头像",
        uploading: "上传中...",
        errorAvatarSize: "头像图片不能超过 2MB",
        errorUploadFailed: "头像上传失败",
    },
    en: {
        appTitle: "AI Photo Booth",
        subtitle: "Nano Banana OS",
        settings: "Settings",
        uploadTitle: "Tap to Upload",
        uploadDesc: "Selfie / Portrait (Max 8MB)",
        changePhoto: "Change Photo",
        makeMagic: "MAKE MAGIC",
        designing: "Designing...",
        save: "SAVE",
        tryAgain: "Try Again",
        failed: "Failed",
        rendering: "RENDERING",
        provider: "Provider",
        official: "Official",
        thirdParty: "Third Party",
        model: "Select Model",
        saveChanges: "Save Changes",
        apiKeyPlaceholder: "Enter API Key (Default: 123456)",
        googleKeyPlaceholder: "Enter Google Key (AIzaSy...)",
        baseUrlPlaceholder: "Enter Base URL (Default: https://proxy.flydao.top)",
        modePreset: "Master Presets",
        modeCustom: "Custom Vibe",
        customPlaceholder: "Describe your dream style...\ne.g. Cyberpunk city, neon lights, futuristic armor, rainy day, cinematic lighting...",
        customTitle: "Custom Creation",
        promptLabel: "Your Prompt",
        customGenBtn: "Generate Custom Vibe",
        errorTooLarge: "Image too large (>8MB) 🍬",
        errorNoKey: "Please configure API Key first 🔑",
        errorGenFailed: "Generation failed 🥲",
        testConnection: "Test Connection",
        testing: "Testing...",
        testSuccess: "Connection Verified ✅",
        testFailed: "Connection Failed: ",
        // Profile
        profileTitle: "My Profile",
        fullName: "Full Name",
        bio: "Bio",
        bioPlaceholder: "A short intro about you...",
        email: "Email",
        subscription: "Subscription",
        planFree: "Free Tier",
        planPro: "Pro Tier",
        saveProfile: "Save Profile",
        backToDash: "Back to Studio",
        profileSaved: "Profile Updated ✨",
        changeAvatar: "Change Avatar",
        uploading: "Uploading...",
        errorAvatarSize: "Avatar must be under 2MB",
        errorUploadFailed: "Avatar upload failed",
    }
};

export const MODEL_OPTIONS = [
    { value: 'nano-banana', label: 'Nano Banana' },
    { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image (Nano Banana Pro)' },
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash' },
];

export const THEMES: Record<string, Theme> = {
    banana: {
        id: 'banana',
        name: 'Nano Banana',
        emoji: '🍌',
        bg: 'bg-[#FEF9C3]', // Yellow-50
        primary: 'bg-[#FACC15]', // Yellow-400
        secondary: 'bg-[#FEF08A]', // Yellow-200
        text: 'text-stone-800',
        accent: 'text-[#854D0E]', // Yellow-900
        border: 'border-[#FDE047]',
        gradient: 'from-[#FACC15] to-[#FB923C]', // Yellow to Orange
        buttonShadow: 'shadow-[#EAB308]/40',
        cardBg: 'bg-white'
    },
    berry: {
        id: 'berry',
        name: 'Sweet Berry',
        emoji: '🍓',
        bg: 'bg-[#FFF1F2]', // Rose-50
        primary: 'bg-[#FB7185]', // Rose-400
        secondary: 'bg-[#FECDD3]', // Rose-200
        text: 'text-rose-900',
        accent: 'text-[#881337]', // Rose-900
        border: 'border-[#FDA4AF]',
        gradient: 'from-[#FB7185] to-[#E11D48]', // Rose to Pink
        buttonShadow: 'shadow-[#F43F5E]/40',
        cardBg: 'bg-white'
    },
    mint: {
        id: 'mint',
        name: 'Fresh Mint',
        emoji: '🌿',
        bg: 'bg-[#ECFCCB]', // Lime-50
        primary: 'bg-[#A3E635]', // Lime-400
        secondary: 'bg-[#D9F99D]', // Lime-200
        text: 'text-lime-900',
        accent: 'text-[#365314]', // Lime-950
        border: 'border-[#BEF264]',
        gradient: 'from-[#A3E635] to-[#22C55E]', // Lime to Green
        buttonShadow: 'shadow-[#84CC16]/40',
        cardBg: 'bg-white'
    },
    cyber: {
        id: 'cyber',
        name: 'Cyber Pop',
        emoji: '🔮',
        bg: 'bg-[#F3E8FF]', // Purple-50
        primary: 'bg-[#C084FC]', // Purple-400
        secondary: 'bg-[#E9D5FF]', // Purple-200
        text: 'text-purple-900',
        accent: 'text-[#581C87]', // Purple-900
        border: 'border-[#D8B4FE]',
        gradient: 'from-[#C084FC] to-[#818CF8]', // Purple to Indigo
        buttonShadow: 'shadow-[#A855F7]/40',
        cardBg: 'bg-white'
    }
};

export const STYLES: StyleItem[] = [
    {
        id: '美式杂志封面',
        title: '美式杂志封面',
        emoji: '🎤',
        prompt: "  Vogue US / Harper’s Bazaar / Vanity Fair 封面级别，大光圈、奶油般虚化背景，黄金大背光+柔光正面补光，人物穿着华丽晚礼服或高级休闲（可参考当前季节流行趋势），妆容精致无瑕、发型蓬松有光泽，姿势经典封面三七分或45度角，底部留白位置可出现极简杂志标题（如大写衬线体“VOGUE”或“BAZAAR”），整体色调饱和而华丽，充满美式奢华与自信."
    },
    {
        id: 'school',
        title: '高中生活',
        emoji: '🏫',
        prompt: "High teen fashion style, elite private school uniform, plaid skirt, golden hour sunlight, soft dreamy atmosphere, 90s retro vibe, Polaroid aesthetic. [IDENTITY CONSTRAINT]: Strictly maintain facial identity."
    },
    {
        id: '美术馆迷失的她',
        title: '美术馆迷失的她',
        emoji: '👾',
        prompt: "人物独自站在空旷的欧洲古典美术馆（大理石地板、高耸穹顶、远处悬挂巨大文艺复兴油画），穿着黑色高领毛衣+宽松长裙或极简长风衣，侧身或回眸凝视一幅古典油画，自然窗光从侧后方洒下形成柔和伦勃朗光，氛围孤独、忧郁、文艺而高级，色调偏冷灰+微暖高光，像 Gregory Crewdson 与陈曼的混合体，极强电影感与故事感."
    },
    {
        id: '职业肖像照',
        title: '职业肖像照',
        emoji: '☁️',
        prompt: "极简主义高级灰/深蓝/白色摄影棚背景，冷白补光+轻微蝴蝶光，主光源45度角打造立体五官，人物穿着高级定制西装或极简职业套装，妆容干净干练，眼神坚定自信，背景完全虚化，整体色调冷峻优雅，像 LinkedIn 头像的最高级版本，参考摄影师 Peter Lindbergh 的极简人像风格."
    }
];
