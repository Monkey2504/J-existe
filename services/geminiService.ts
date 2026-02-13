
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * ARCHITECTE DE RÉCITS : Transforme l'invisible en indispensable.
 * Utilise Gemini 3 Flash pour sa capacité de raisonnement contextuel rapide.
 */
export const analyserProfilComplet = async (recitBrut: string, base64Image?: string) => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const parts: any[] = [
      { text: `CONTEXTE : Tu es un biographe public travaillant pour une unité d'élite de médiation sociale à Bruxelles.
      DOCUMENT BRUT : ${recitBrut}. 
      
      EXIGENCE NARRATIVE (Strictement 200-280 mots) :
      1. L'IDENTITÉ SOCLE : Analyse son savoir-faire technique passé. Utilise un vocabulaire métier précis (maçonnerie, sysadmin, service diplomatique). Décris la fierté du geste.
      2. LA MÉCANIQUE DE LA RUPTURE : Identifie précisément l'événement systémique qui a brisé la trajectoire. Ne sois pas flou : parle de rupture de bail, d'accident de travail sans assurance, de saturation cognitive (burn-out).
      3. LA GESTUELLE DE DIGNITÉ : Relève un détail du présent qui prouve la résistance (la propreté d'un foulard, le soin apporté à un livre, la politesse d'une observation).
      
      STRUCTURE DES BESOINS (Lister 7 items spécifiques) :
      - 2 Besoins de Survie Technique (matériel de haute qualité, résistance thermique).
      - 2 Besoins de Dignité (hygiène spécifique, vêtements de coupe professionnelle).
      - 3 Besoins de Réactivation (outils du métier passé, livres de réflexion, abonnements de mobilité).

      TON : Noble, clinique, littéraire. Refuse le misérabilisme. Style : Grand Reportage.` }
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
        systemInstruction: "Tu es un écrivain public d'exception. Ton but est de rendre l'invisibilité impossible. Tes textes doivent forcer le lecteur à voir un citoyen égal en dignité, pas un objet de charité.",
        temperature: 0.6
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Erreur narrative:", error);
    return "Le registre est en cours de maintenance narrative.";
  }
};

export const reformulerRecit = async (recitBrut: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rédige une trajectoire de vie monumentale et précise à partir de ces notes : ${recitBrut}. Longueur attendue : 250 mots.`,
      config: {
        systemInstruction: "Style : Littérature de réel. Précision sociologique. Dignité absolue. Ton de grand reporter.",
        temperature: 0.5
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Erreur reformulation:", error);
    return recitBrut;
  }
};

export const genererImageProfil = async (recit: string, nom: string) => {
  try {
    const prompt = `Hyper-realistic black and white portrait of ${nom}. Cinematic lighting (Chiaroscuro), extreme detail on skin texture, deep expressive eyes looking at the lens. Background: Poetic and blurred view of Brussels (Manneken Pis area or modern office district). Style: Peter Lindbergh. The person must look like a dignified protagonist. No stereotypes of homelessness. 8k, professional photography.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const trouverSolutionsAide = async (besoin: string, localisation: string) => {
  try {
    const query = `Unités de soutien social, associations de quartier et centres d'accueil spécialisés pour "${besoin}" à proximité de "${localisation}" (Bruxelles). Donne des adresses précises.`;
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { tools: [{ googleSearch: {} }] }
    });
  } catch (error) {
    throw error;
  }
};
