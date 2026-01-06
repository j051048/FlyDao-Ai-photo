
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an image using Gemini models (nano-banana series).
 * Follows official SDK guidelines for initialization and content generation.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image'): Promise<string> => {
    // CRITICAL: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Create a new instance right before making an API call to ensure it always uses the most up-to-date key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract base64 data if it contains the data:image prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Use generateContent for nano-banana series models (e.g., gemini-2.5-flash-image, gemini-3-pro-image-preview)
    // Mapping aliases to correct full model names if necessary
    const targetModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;

    const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg', // Standardize to jpeg for consistent processing
                        data: cleanBase64
                    }
                }
            ]
        },
        // Optional configuration can be added here (e.g., aspectRatio)
    });

    // The output response may contain both image and text parts; iterate through all parts to find the image part.
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
