import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WordPair } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWordPair = async (excludeWords: string[] = []): Promise<WordPair> => {
  try {
    const ai = getClient();
    
    const exclusionPrompt = excludeWords.length > 0
      ? `DAFTAR TERLARANG (Jangan gunakan kata-kata ini atau sinonim dekatnya karena sudah dipakai): ${excludeWords.join(", ")}.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buatlah sepasang kata untuk permainan pesta 'Undercover' dalam Bahasa Indonesia. 
      Satu kata adalah 'mainWord' (kata umum untuk Warga Sipil), kata lainnya adalah 'undercoverWord' (mirip tapi berbeda). 
      Hindari kata-kata yang terlalu sulit.
      ${exclusionPrompt}
      Buatlah pasangan kata yang segar dan berbeda dari sebelumnya.
      Kembalikan dalam format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainWord: { type: Type.STRING },
            undercoverWord: { type: Type.STRING }
          },
          required: ["mainWord", "undercoverWord"]
        } as Schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as WordPair;
  } catch (error) {
    console.error("Failed to generate words:", error);
    // Fallback if AI fails
    return {
      mainWord: "Kopi",
      undercoverWord: "Teh"
    };
  }
};

export const judgeMrWhiteGuess = async (mainWord: string, guess: string): Promise<boolean> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Konteks: Permainan 'Undercover' dalam Bahasa Indonesia. Kata rahasia utamanya adalah "${mainWord}". Mr. White menebak "${guess}".
      Tugas: Tentukan apakah tebakan tersebut secara efektif benar (cocok persis, variasi sinonim yang sangat dekat, atau konsep yang sama).
      Wajib kembalikan JSON: { "isCorrect": boolean }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN }
          },
          required: ["isCorrect"]
        } as Schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    return result.isCorrect;
  } catch (error) {
    console.error("AI Judging failed:", error);
    // Fallback: strict case-insensitive match
    return mainWord.toLowerCase().trim() === guess.toLowerCase().trim();
  }
};