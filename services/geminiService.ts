import { GoogleGenAI } from "@google/genai";

/**
 * Generates an image using Gemini models via @google/genai SDK.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image'): Promise<string> => {
    // API key must be from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Prepare inputs
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    // Simple mime type detection or default
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        text: prompt
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        });

        // Find image part in response
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const respMimeType = part.inlineData.mimeType || 'image/png';
                    return `data:${respMimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("No image generated in response.");

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate image");
    }
};
