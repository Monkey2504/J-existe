
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
 * Génération d'un portrait par IA basé sur le récit
 */
export const genererImageProfil = async (recit: string, nom: string) => {
  try {
    const prompt = `A dignified black and white street photography portrait of a person named ${nom}. 
    Context: ${recit.substring(0, 200)}. 
    Style: Professional documentary photography, 35mm film grain, cinematic lighting, focused on human dignity, high contrast, realistic features. 
    Avoid stereotypes, focus on the gaze.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur génération image:", error);
    return null;
  }
};

/**
 * Recherche de solutions d'aide avec Grounding Google Search.
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
