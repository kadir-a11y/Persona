import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateContent(prompt: string, model = "gemini-2.5-flash-lite") {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text || "";
}
