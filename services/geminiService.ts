
import { GoogleGenAI, Type } from "@google/genai";

/**
 * ARCHITECTE DE RÉCITS : Transforme l'invisible en indispensable.
 * Analyse structurée pour extraire les rubriques standardisées avec une profondeur littéraire.
 */
export const analyserProfilComplet = async (recitBrut: string, imageUrl?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    
    let contents: any;
    if (imageUrl) {
      const base64Data = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
      const mimeType = imageUrl.includes('data:') ? imageUrl.split(';')[0].split(':')[1] : 'image/jpeg';
      contents = {
        parts: [
          { text: `Analyse ce récit de terrain et l'image associée pour produire un portrait de dignité sociale profond et détaillé : "${recitBrut}"` },
          { inlineData: { mimeType, data: base64Data } }
        ]
      };
    } else {
      contents = `Analyse ce récit de terrain et extrais un portrait de dignité sociale profond et détaillé : "${recitBrut}"`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: `Tu es un écrivain public et sociologue spécialisé dans la grande précarité à Bruxelles. 
        Ta mission est de transformer des notes de terrain en un "Document de Dignité" riche et volumineux.
        
        RÈGLES D'ÉCRITURE :
        - Écris au moins 150 à 200 mots par rubrique.
        - Utilise un style littéraire, digne, "Le Monde" ou "Libération".
        - Évite les clichés. Cherche la singularité de l'individu.
        - Analyse les silences, la posture, et le contexte urbain.
        
        Rubriques à remplir généreusement :
        - Bio : Un récit biographique complet, du passé glorieux à la rupture.
        - Santé Mentale : Une analyse fine de la résilience, des traumatismes et de la lucidité actuelle.
        - Entourage : Description détaillée du réseau (famille perdue, amis de rue, solitude habitée).
        - Besoins : Liste technique mais expliquée (pourquoi ce besoin est vital).
        - Passions : Les vestiges culturels ou techniques de la personne (ce qui le fait briller).
        - Projet : Une vision à long terme, même si elle semble inatteignable aujourd'hui.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING, description: "Récit biographique long et narratif." },
            mental_health: { type: Type.STRING, description: "Analyse détaillée de l'état psychique et de la résilience." },
            family_circle: { type: Type.STRING, description: "Description profonde du tissu social." },
            needs: { type: Type.STRING, description: "Besoins expliqués avec contexte." },
            passions: { type: Type.STRING, description: "Exploration des goûts et compétences." },
            projects: { type: Type.STRING, description: "Aspirations et étapes de reconstruction." }
          },
          required: ["bio", "mental_health", "family_circle", "needs", "passions", "projects"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
