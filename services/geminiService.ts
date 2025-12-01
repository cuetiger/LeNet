import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const explainConcept = async (concept: string, context: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key not configured. Please check environment.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the concept of "${concept}" in the context of a CNN (LeNet-5). 
      Context provided: ${context}. 
      Keep the explanation concise, under 80 words, and suitable for a beginner student.`,
    });
    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error retrieving explanation.";
  }
};

export const analyzeFeatureMap = async (layerName: string, featuresDescription: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "API Key not configured.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `I am looking at the output of layer ${layerName} in a CNN. 
            The visual features look like: ${featuresDescription}.
            Briefly explain what this layer might be detecting (e.g., edges, textures, object parts). Keep it under 50 words.`
        });
        return response.text || "No analysis available.";
    } catch (error) {
        return "Error analyzing features.";
    }
}
