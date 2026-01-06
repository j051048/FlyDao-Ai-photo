
import { GoogleGenAI } from "@google/genai";

export interface GenAIConfig {
    apiKey?: string;
    baseUrl?: string;
}

/**
 * Helper to initialize AI client with optional config
 */
const getClient = (config?: GenAIConfig) => {
    // If config provides keys, use them. Otherwise fallback to process.env (legacy/dev support)
    const apiKey = config?.apiKey || process.env.API_KEY;
    
    // GoogleGenAI options allow passing baseUrl if needed for proxies
    const options: any = { apiKey };
    if (config?.baseUrl) {
        options.baseUrl = config.baseUrl;
    }
    
    return new GoogleGenAI(options);
};

/**
 * Generates an image using Gemini models.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image', config?: GenAIConfig): Promise<string> => {
    const ai = getClient(config);
    
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const targetModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;

    const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: cleanBase64
                    }
                }
            ]
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${base64EncodeString}`;
        } else if (part.text) {
            console.debug("Model text response:", part.text);
        }
    }

    throw new Error("No image generated. The model might have refused the request due to safety filters or reached its token limit.");
};

/**
 * Tests the connection to the Gemini API (or Proxy).
 */
export const testGeminiConnection = async (config: GenAIConfig, model: string): Promise<string> => {
    const ai = getClient(config);
    const targetModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;
    
    // We send a very simple text prompt to check connectivity
    const response = await ai.models.generateContent({
        model: targetModel,
        contents: { parts: [{ text: "Hello, reply with 'OK' if you receive this." }] },
        config: {
            maxOutputTokens: 10
        }
    });

    return response.text || "No text response received, but connection seems established.";
};
