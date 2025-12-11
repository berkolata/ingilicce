import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AiEvaluation, WordContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EVALUATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN, description: "True if the word is used correctly in the sentence." },
    feedback: { type: Type.STRING, description: "Constructive feedback explaining why it is correct or incorrect." },
    betterSentence: { type: Type.STRING, description: "An improved or alternative version of the sentence." },
  },
  required: ["isCorrect", "feedback", "betterSentence"],
};

const CONTEXT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 example sentences using the word." },
    synonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 synonyms for the word." },
    etymology: { type: Type.STRING, description: "A brief, fun fact about the word's origin." },
  },
  required: ["examples", "synonyms", "etymology"],
};

export const evaluateUserSentence = async (word: string, definition: string, userSentence: string): Promise<AiEvaluation> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Word: ${word}
        Definition: ${definition}
        User's Sentence: ${userSentence}
        
        Task: Analyze if the user used the word correctly based on the definition. 
        Provide strict but helpful feedback. Return JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: EVALUATION_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AiEvaluation;
  } catch (error) {
    console.error("Evaluation error:", error);
    return {
      isCorrect: false,
      feedback: "There was an error connecting to the AI tutor. Please try again.",
      betterSentence: "",
    };
  }
};

export const getWordContext = async (word: string, definition: string): Promise<WordContext> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Word: ${word}
        Definition: ${definition}
        
        Task: Provide 3 distinct example sentences, 3 synonyms, and a brief etymology/origin fact.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: CONTEXT_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as WordContext;
  } catch (error) {
    console.error("Context error:", error);
    return {
      examples: ["Loading examples failed."],
      synonyms: ["N/A"],
      etymology: "Origin unavailable.",
    };
  }
};