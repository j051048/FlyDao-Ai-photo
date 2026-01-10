
import { GoogleGenAI } from "@google/genai";

interface GeminiConfig {
    apiKey?: string;
    baseUrl?: string;
}

/**
 * Generates an image using Gemini models via Google GenAI SDK.
 * Accepts optional configuration to override environment variables.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image', config?: GeminiConfig): Promise<string> => {
    // Priority: Custom Config > Environment Variable
    const apiKey = config?.apiKey || process.env.API_KEY;
    
    if (!apiKey) {
        throw new Error("API Key is missing. Please check your settings.");
    }

    const clientOptions: any = { apiKey };
    if (config?.baseUrl) {
        clientOptions.baseUrl = config.baseUrl;
    }

    const ai = new GoogleGenAI(clientOptions);

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
 * Test the connection to the Gemini API with the provided configuration.
 */
export const testGeminiConnection = async (config: GeminiConfig, model: string): Promise<string> => {
    const apiKey = config.apiKey || process.env.API_KEY;
    
    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    const clientOptions: any = { apiKey };
    if (config.baseUrl) {
        clientOptions.baseUrl = config.baseUrl;
    }

    const ai = new GoogleGenAI(clientOptions);

    try {
        // Send a lightweight text-only request to check connectivity
        // We use a simple text model or the same model if it supports text generation (which Gemini models do)
        const response = await ai.models.generateContent({
            model: model,
            contents: "Hello, reply with 'OK'.",
        });

        if (response.text) {
            return `Success! Model replied: ${response.text.slice(0, 20)}...`;
        } else {
            return "Connected, but no text response received.";
        }
    } catch (error: any) {
        throw new Error(`Connection failed: ${error.message}`);
    }
};
