
import { GoogleGenAI } from "@google/genai";

const INSTRUCTION_GREFFIER = `Tu es un GREFFIER SOCIAL FACTUEL. Ton but est de créer une synthèse administrative d'un récit de vie.

INTERDICTIONS ABSOLUES :
1. NE JAMAIS utiliser d'adjectifs psychologiques (ex: "déprimé", "instable", "triste").
2. NE JAMAIS interpréter des signes physiques comme des addictions (ex: "yeux rouges" ne devient PAS "alcoolique").
3. NE JAMAIS inventer de passé professionnel. Si non mentionné, écris "Parcours antérieur non documenté".
4. NE JAMAIS porter de jugement de valeur.

STRUCTURE OBLIGATOIRE :
- ÉLÉMENTS DE PARCOURS : (Faits datés ou métiers occupés)
- POINT DE RUPTURE : (L'événement déclencheur matériel de la rue)
- SITUATION MATÉRIELLE ACTUELLE : (Zone d'occupation et besoins identifiés)

Style : Clinique, neutre, sans aucune empathie feinte ou misérabilisme.`;

const executerRequeteGemini = async (prompt: string, instructionSysteme: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: instructionSysteme,
      temperature: 0, // Désactivation totale de la créativité pour rester sur les faits
      maxOutputTokens: 600,
      topP: 0.1
    }
  });
  return response.text?.trim() || "";
};

export const reformulerRecit = async (recitBrut: string): Promise<string> => {
  if (!recitBrut || recitBrut.trim().length < 20) throw new Error("Contenu insuffisant.");
  return await executerRequeteGemini(`Reformule ces notes de terrain : ${recitBrut}`, INSTRUCTION_GREFFIER);
};

export const synthetiserQuestionnaire = async (reponses: {
  declencheur: string;
  difficultes: string;
  parcours: string;
  localisation: string;
}): Promise<string> => {
  const prompt = `Synthétise ces faits bruts : 
  - Passé : ${reponses.parcours}
  - Rupture : ${reponses.declencheur}
  - Actuel : ${reponses.difficultes}
  - Zone : ${reponses.localisation}`;
  
  return await executerRequeteGemini(prompt, INSTRUCTION_GREFFIER);
};
