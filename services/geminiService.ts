
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyse multimodale : Texte + Image
 */
export const analyserProfilComplet = async (recitBrut: string, base64Image?: string) => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const parts: any[] = [
      { text: `CONTEXTE DE RUE : ${recitBrut}. 
      TÂCHE : 
      1. Reformule ce récit de façon factuelle, digne et clinique.
      2. Identifie les besoins matériels EXPLICITES (vêtements, nourriture, outils).
      3. Si image fournie, identifie besoins IMPLICITES basés sur l'état de l'équipement visible.
      Structure : PARCOURS / RUPTURE / BESOINS. Sois concis.` }
    ];

    if (base64Image) {
      const cleanData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanData
        }
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: "Tu es un assistant social expert à Bruxelles. Ta mission est de transformer des notes de terrain en dossier d'existence factuel et digne, sans pathos.",
        temperature: 0.1
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Erreur analyserProfilComplet:", error);
    return "Erreur lors de l'analyse du récit par l'intelligence artificielle.";
  }
};

/**
 * Génération d'un portrait par IA basé sur le récit.
 */
export const genererImageProfil = async (recit: string, nom: string) => {
  try {
    const prompt = `A highly detailed, dignified black and white close-up portrait of a person named ${nom}. 
    Based on this context: ${recit.substring(0, 300)}. 
    Visual Style: Professional street photography, 35mm film grain, soft cinematic natural light, showing resilience. 
    Background: Blurred urban environment. No stereotypes, focus on eyes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur génération image IA:", error);
    return null;
  }
};

/**
 * Recherche de solutions d'aide avec Grounding Google Search.
 */
export const trouverSolutionsAide = async (besoin: string, localisation: string) => {
  try {
    const model = 'gemini-3-flash-preview';
    const query = `Où trouver de l'aide pour "${besoin}" à proximité de "${localisation}" à Bruxelles ? Donne 3 adresses précises d'associations ou services sociaux.`;
    
    return await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
  } catch (error) {
    console.error("Erreur grounding search:", error);
    throw error;
  }
};

export const reformulerRecit = async (recitBrut: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Reformule ce récit social de façon factuelle et digne : ${recitBrut}`,
      config: {
        systemInstruction: "Tu es un expert en travail social. Neutralité et respect de la dignité humaine sont tes priorités.",
        temperature: 0.1
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Erreur reformulerRecit:", error);
    return recitBrut;
  }
};
