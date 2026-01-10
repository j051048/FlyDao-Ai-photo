import { GoogleGenAI } from "@google/genai";

/**
 * Generates an image using Gemini models via Google GenAI SDK.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image'): Promise<string> => {
    // API key must be from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Clean Base64 string if it has prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: cleanBase64
                        }
                    }
                ]
            }
        });

        // Parse Response to find Image
        // Gemini 2.5/Pro models return image in inlineData
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
            }
        }

        throw new Error("No image generated. The model might have refused the request due to safety filters.");
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate image");
    }
};

/**
 * Stub for test connection - functionality removed as we rely on SDK and env var.
 */
export const testGeminiConnection = async (_config: any, _model: string): Promise<string> => {
    return "Connection check is managed by the environment configuration.";
};
