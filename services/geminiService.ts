
interface GeminiConfig {
    apiKey?: string;
    baseUrl?: string;
}

/**
 * Generates an image using Gemini models via REST API (fetch).
 * Designed to be proxy-compatible and tolerant of loose API keys.
 */
export const generateImageWithGemini = async (prompt: string, imageBase64: string, model: string = 'gemini-2.5-flash-image', config?: GeminiConfig): Promise<string> => {
    // 1. Construct URL
    // Default to Google API, but allow full override via baseUrl
    const baseUrl = config?.baseUrl ? config.baseUrl.replace(/\/+$/, "") : "https://generativelanguage.googleapis.com/v1beta";
    const apiKey = config?.apiKey || process.env.API_KEY || ""; 
    
    // Construct final endpoint. If using a proxy, it usually mimics the Google path structure.
    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

    // 2. Prepare Payload
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    // Standard Gemini REST Payload
    const payload = {
        contents: [
            {
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
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error (${response.status}): ${errText.slice(0, 200)}`);
        }

        const data = await response.json();

        // 3. Parse Response
        // Look for image data in the response structure
        const parts = data.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
            }
        }

        throw new Error("No image generated in response.");

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate image via fetch");
    }
};

/**
 * Test the connection to the Gemini API using native fetch.
 */
export const testGeminiConnection = async (config: GeminiConfig, model: string): Promise<string> => {
    const baseUrl = config.baseUrl ? config.baseUrl.replace(/\/+$/, "") : "https://generativelanguage.googleapis.com/v1beta";
    const apiKey = config.apiKey || process.env.API_KEY || "";
    
    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                parts: [{ text: "Hello, reply with 'OK'." }]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            return `Success! Model replied: ${text.slice(0, 20)}...`;
        } else {
            return "Connected, but empty response.";
        }
    } catch (error: any) {
        throw new Error(`Connection failed: ${error.message}`);
    }
};
