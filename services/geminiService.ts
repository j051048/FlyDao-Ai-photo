import { GoogleGenAI } from "@google/genai";

export const generateImageWithGemini = async (prompt: string, imageBase64: string): Promise<string> => {
    // Note: The API key must be available in process.env.API_KEY
    // We add a safety check for 'process' to prevent browser ReferenceErrors if the build environment didn't polyfill it.
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

    if (!apiKey) {
        throw new Error("System API Key is missing. Please configure process.env.API_KEY or use Third Party Provider in settings.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Extract base64 data if it contains the data:image prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg', // Standardize to jpeg for upload if possible, or source type
                        data: cleanBase64
                    }
                }
            ]
        }
    });

    // Check for inlineData (Base64) in the response
    // The model typically returns an image in parts if successful for image generation tasks
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        // Sometimes it might return a text refusal if the safety filter trips
        if (part.text && !part.inlineData) {
            console.warn("Model returned text instead of image:", part.text);
        }
    }

    throw new Error("No image generated. The model might have refused the request due to safety filters.");
};