
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * ARCHITECTE DE RÉCITS : Transforme l'invisible en indispensable.
 * Analyse structurée pour extraire les rubriques standardisées.
 */
// Comment: Added optional imageUrl parameter to match usage in QuestionnairePage and support multimodal analysis.
export const analyserProfilComplet = async (recitBrut: string, imageUrl?: string) => {
  try {
    const model = 'gemini-3-pro-preview';
    
    let contents: any;
    if (imageUrl) {
      // Comment: Prepare multipart content if an image is provided.
      const base64Data = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
      const mimeType = imageUrl.includes('data:') ? imageUrl.split(';')[0].split(':')[1] : 'image/jpeg';
      contents = {
        parts: [
          { text: `Analyse le récit suivant et l'image associée pour extraire les rubriques pour un registre de dignité sociale à Bruxelles : "${recitBrut}"` },
          { inlineData: { mimeType, data: base64Data } }
        ]
      };
    } else {
      contents = `Analyse le récit suivant et extrais les rubriques pour un registre de dignité sociale à Bruxelles : "${recitBrut}"`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: `Tu es un expert en sociologie et en médiation humaine. 
        Ta mission est de structurer un récit de vie brut en 6 rubriques standardisées.
        Utilise un ton respectueux, factuel et puissant. Évite tout misérabilisme.
        
        Rubriques attendues :
        - Bio : Un résumé narratif fort (50-80 mots).
        - Santé Mentale : État psychologique, résilience et lucidité.
        - Entourage : Réseau social, familial ou solitude.
        - Besoins : Liste technique des priorités.
        - Passions : Ce qui anime encore l'individu (compétences, goûts).
        - Projet : Aspirations de sortie de rue ou objectifs immédiats.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING },
            mental_health: { type: Type.STRING },
            family_circle: { type: Type.STRING },
            needs: { type: Type.STRING },
            passions: { type: Type.STRING },
            projects: { type: Type.STRING }
          },
          required: ["bio", "mental_health", "family_circle", "needs", "passions", "projects"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erreur narrative structurée:", error);
    return null;
  }
};

export const reformulerRecit = async (recitBrut: string) => {
  return analyserProfilComplet(recitBrut);
};

export const genererImageProfil = async (recit: string, nom: string) => {
  try {
    const prompt = `Hyper-realistic black and white portrait of a person named ${nom}. Cinematic lighting, expressive detail showing resilience and dignity. Background: Subtle, blurred Brussels urban textures. Style: Professional documentary photography. Ensure the person looks respected and dignified.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1" 
        } 
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur génération image:", error);
    return null;
  }
};

export const trouverSolutionsAide = async (besoin: string, localisation: string) => {
  try {
    const query = `Services sociaux, associations et aides publiques pour "${besoin}" à "${localisation}" (Bruxelles).`;
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: { 
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
  } catch (error) {
    console.error("Erreur recherche aide:", error);
    throw error;
  }
};
