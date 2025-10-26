
import { GoogleGenAI } from "@google/genai";
import { getGeminiUsage, setGeminiUsage } from './firebaseService.js';

const DAILY_LIMIT = 50;

export const generateOrderSummary = async (order, userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const usage = await getGeminiUsage(userId);

        if (usage.date === today && usage.count >= DAILY_LIMIT) {
            console.log('Gemini API daily limit reached.');
            return null;
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Generate a very brief, friendly, and professional summary for the following B2B order placed by a retailer.
            The summary should be a single short paragraph, suitable for a confirmation screen.
            - Order ID: ${order.id.slice(-6)}
            - Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
            - Total Amount: ₹${order.totalAmount.toFixed(2)}
            - Key Items (list up to 3):
              ${order.items.slice(0, 3).map(item => `- ${item.quantity} x ${item.description} (${item.style})`).join('\n')}

            Example: "Your order #${order.id.slice(-6)} is confirmed! You've ordered ${order.items.reduce((sum, item) => sum + item.quantity, 0)} items, totaling ₹${order.totalAmount.toFixed(2)}. We'll process it shortly."
            Keep it concise and positive.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text;

        // Update usage in Firebase
        const newCount = usage.date === today ? usage.count + 1 : 1;
        await setGeminiUsage(userId, { date: today, count: newCount });

        return summary;
    } catch (error) {
        console.error('Error generating AI summary:', error);
        // Fail silently for the user
        return null;
    }
};
