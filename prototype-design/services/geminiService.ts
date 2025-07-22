
import { GoogleGenAI, Type, GenerateContentResponse, UsageMetadata } from "@google/genai";
import { AnalysisResult, TokenUsage, ChildProfile } from '../types';
import { AI_MODEL } from '../constants';
import { getReminder } from './reminderService';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    isFocused: {
      type: Type.BOOLEAN,
      description: "True if the child appears to be focused on their work (e.g., looking at books, writing). False if looking away, playing with objects, head down on desk, etc."
    },
    isOnSeat: {
      type: Type.BOOLEAN,
      description: "True if the child is visible and sitting at their desk."
    }
  },
  required: ["isFocused", "isOnSeat"]
};

// Function to convert base64 to a format gemini understands
const fileToGenerativePart = (base64: string, mimeType: string) => {
    // remove the data:image/jpeg;base64, part
    const pureBase64 = base64.substring(base64.indexOf(',') + 1);
    return {
        inlineData: {
            data: pureBase64,
            mimeType
        },
    };
};

export const analyzeImage = async (
    base64Image: string,
    profile: ChildProfile
): Promise<{ analysis: AnalysisResult, usage: TokenUsage }> => {

    const systemInstruction = `Analyze the image of a child studying. Is the child focused and on their seat? Child info: ${profile.nickname}, ${profile.age}, ${profile.grade}. Respond using the required JSON schema.`;

    const imagePart = fileToGenerativePart(base64Image, 'image/jpeg');
    const textPart = { text: "Please analyze this image." }; // Text part is minimal

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: AI_MODEL,
            contents: { parts: [textPart, imagePart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.7,
                // Disable thinking to significantly reduce token consumption for gemini-2.5-flash.
                thinkingConfig: { thinkingBudget: 0 },
            }
        });

        const usage = response.usageMetadata;
        const promptTokens = usage?.promptTokenCount ?? 0;
        const totalTokens = usage?.totalTokenCount ?? 0;
        // Use the accurate candidatesTokenCount for the output.
        // The previous calculation (total - prompt) was incorrect as it included "thinking" tokens.
        const outputTokens = usage?.candidatesTokenCount ?? 0;

        const tokenUsage: TokenUsage = {
            input: promptTokens,
            output: outputTokens,
            total: totalTokens
        };
        
        const partialAnalysis: { isFocused: boolean; isOnSeat: boolean } = JSON.parse(response.text);
        const reminder = getReminder(profile, partialAnalysis.isFocused, partialAnalysis.isOnSeat);

        const analysis: AnalysisResult = {
            ...partialAnalysis,
            reminder: reminder,
        };

        return { analysis, usage: tokenUsage };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI analysis.");
    }
};
