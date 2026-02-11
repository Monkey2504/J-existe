
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const reformulateStory = async (rawStory: string): Promise<string> => {
  if (!rawStory || rawStory.trim().length < 20) {
    throw new Error("Récit trop court.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un enquêteur social spécialisé dans le recensement de rue. Tu dois rédiger un compte-rendu de situation DÉTAILLÉ et LONG.
      
      RÈGLES STRICTES :
      1. STYLE ADMINISTRATIF ET CLINIQUE. Aucun lyrisme, aucune métaphore, aucune poésie.
      2. DÉVELOPPE LES FAITS : Ne te contente pas de mots-clés. Fais des phrases complètes, froides et informatives.
      3. STRUCTURE : Décris précisément le parcours professionnel, les causes juridiques ou économiques de la chute, et la réalité matérielle actuelle (santé, environnement, survie).
      4. TON : Neutre, objectif, comme un rapport de police ou de CPAS.
      5. LONGUEUR : Entre 800 et 1200 caractères.
      
      TÉMOIGNAGE BRUT : ${rawStory}`,
      config: { 
        temperature: 0.3,
        maxOutputTokens: 1000 
      }
    });
    return response.text?.trim().replace(/^["']|["']$/g, '') || "";
  } catch (err) {
    throw new Error("Erreur reformulation.");
  }
};

export const synthesizeQuestionnaire = async (answers: {
  trigger: string;
  dailyHardship: string;
  background: string;
  location: string;
}): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu rédiges une synthèse de dossier social approfondie pour une base de données d'urgence. 
      Rédige un texte LONG et EXHAUSTIF à partir des données fournies.
      
      RÈGLES :
      1. STYLE DIRECT ET FACTUEL. Pas de pitié artificielle, pas d'adjectifs de style.
      2. ANALYSE : Articule les réponses pour expliquer la trajectoire de la personne.
      3. PRÉCISION : Détaille la vie d'avant, le mécanisme précis de rupture et les conditions de survie actuelles.
      4. LONGUEUR : Vise 1000 caractères.
      
      Données récoltées :
      - Antécédents : ${answers.background}
      - Mécanisme de rupture : ${answers.trigger}
      - État de précarité quotidien : ${answers.dailyHardship}
      - Zone de présence : ${answers.location}
      
      Format : Rapport social professionnel, sans fioritures littéraires.`,
      config: { 
        temperature: 0.3,
        maxOutputTokens: 1000 
      }
    });
    return response.text?.trim().replace(/^["']|["']$/g, '') || "";
  } catch (err) {
    throw new Error("Erreur synthèse.");
  }
};
