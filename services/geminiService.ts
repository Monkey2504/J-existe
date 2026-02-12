
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyse multimodale : Texte + Image
 */
export const analyserProfilComplet = async (recitBrut: string, base64Image?: string) => {
  const model = 'gemini-3-flash-preview';
  
  const parts: any[] = [
    { text: `CONTEXTE DE RUE : ${recitBrut}. 
    TÂCHE : 
    1. Reformule ce récit de façon factuelle, digne et clinique.
    2. Identifie les besoins matériels EXPLICITES.
    3. Si image, identifie besoins IMPLICITES.
    Structure : PARCOURS / RUPTURE / BESOINS.` }
  ];

  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image
      }
    });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      systemInstruction: "Tu es un assistant social expert. Ta mission est de transformer des notes de terrain en dossier d'existence factuel.",
      temperature: 0.1
    }
  });

  return response.text || "";
};

/**
 * Recherche de solutions d'aide avec Grounding Google Search.
 * Retourne la réponse complète pour permettre l'extraction des URLs.
 */
export const trouverSolutionsAide = async (besoin: string, localisation: string) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: `Donne 3 lieux précis (associations ou commerces) où trouver ${besoin} à proximité de ${localisation} à Bruxelles. Donne l'adresse et le nom de l'endroit.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response;
};

export const reformulerRecit = async (recitBrut: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Reformule ce récit social de façon factuelle : ${recitBrut}`,
    config: {
      systemInstruction: "Tu es un expert en travail social. Neutralité et dignité sont tes priorités.",
      temperature: 0.1
    }
  });
  return response.text || "";
};
