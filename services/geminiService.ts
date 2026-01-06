
export interface GenAIConfig {
    apiKey?: string;
    baseUrl?: string;
}

/**
 * Generates an image using Gemini models via REST API fetch.
 * Designed to work with proxies that might handle authentication server-side.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image', config?: GenAIConfig): Promise<string> => {
    // Default config values
    const apiKey = config?.apiKey || process.env.API_KEY || 'no-key';
    const baseUrl = config?.baseUrl || 'https://proxy.flydao.top/v1';

    // Handle Model Aliases
    const targetModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;
    
    // Clean Base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Construct URL
    // Ensure baseUrl doesn't have a trailing slash if we are appending /models...
    // But usually proxies like standard OpenAI/Gemini format.
    // Given the user instruction "proxy.flydao.top/v1", we append standard Gemini REST path.
    // The standard path is /models/{model}:generateContent
    const url = `${baseUrl.replace(/\/$/, '')}/models/${targetModel}:generateContent?key=${apiKey}`;

    // Construct Body (Standard Gemini JSON REST Format)
    const body = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: cleanBase64
                    }
                }
            ]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Parse Response to find Image
    // Gemini 2.5/Pro models return image in inlineData
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
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
    const apiKey = config?.apiKey || 'no-key';
    const baseUrl = config?.baseUrl || 'https://proxy.flydao.top/v1';
    const targetModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;

    const url = `${baseUrl.replace(/\/$/, '')}/models/${targetModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello, reply with 'OK'." }] }],
            // Use generationConfig for REST API (SDK uses 'config' but maps it)
            generationConfig: { maxOutputTokens: 10 } 
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Connection established (No text response)";
};
