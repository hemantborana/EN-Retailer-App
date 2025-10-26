import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchResponseSchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, description: "The product category, like 'bra', 'panty', 'camisole', etc." },
        color: { type: Type.STRING, description: "A color name, like 'black', 'skin', or 'white'." },
        size: { type: Type.STRING, description: "A size, like '34B', 'M', or 'Large'." },
        attributes: {
            type: Type.ARRAY,
            description: "Keywords or features like 'padded', 'non-padded', 'wired', 'seamless', 'cotton', 't-shirt bra'.",
            items: { type: Type.STRING }
        },
        inStock: { type: Type.BOOLEAN, description: "Set to true if user asks for items that are 'in stock' or 'available'." }
    }
};

export const parseSearchQuery = async (query) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following search query into filters: "${query}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: searchResponseSchema,
                systemInstruction: "You are an intelligent assistant for a B2B lingerie ordering platform. Your task is to parse a user's natural language search query into a structured JSON object. The product data includes style code, description, color, size, category, and stock quantity. Identify any of these attributes in the user's query. Only return attributes found in the query."
            }
        });
        const jsonText = response.text.trim();
        return { success: true, filters: JSON.parse(jsonText) };
    } catch (error) {
        console.error("Error parsing search query:", error);
        return { success: false, message: "Could not understand search query." };
    }
};

export const generateOrderSummary = async (orderItems) => {
    try {
        const itemInfo = orderItems.map(({ style, category, quantity }) => ({ style, category, quantity }));
        const prompt = `Here is a list of items from a retailer's order: ${JSON.stringify(itemInfo)}. Generate a short, insightful summary of their purchasing patterns. Mention popular categories or styles. Do not mention the total price or any monetary values. Keep it friendly and professional.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating order summary:", error);
        return "Could not generate summary at this time.";
    }
};

const featureResponseSchema = {
    type: Type.OBJECT,
    properties: {
        features: {
            type: Type.ARRAY,
            description: "An array of 3-4 concise feature strings.",
            items: { type: Type.STRING }
        }
    }
};

export const getProductFeatures = async (style) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search online for the "Enamor ${style}" lingerie product. Provide 3-4 concise, key features. Focus on material, fit, and unique selling points. For example: "Non-padded, full coverage", "Breathable cotton fabric", "Seamless cups".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: featureResponseSchema
            }
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson.features && Array.isArray(parsedJson.features) && parsedJson.features.every(f => typeof f === 'string')) {
            return parsedJson.features;
        }
        return [];
    } catch (error) {
        console.error(`Error fetching features for ${style}:`, error);
        return [];
    }
};