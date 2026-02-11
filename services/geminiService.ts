
import { GoogleGenAI, Type } from "@google/genai";

// Types pour la configuration et la réponse
export interface ReformulationConfig {
  maxLength?: number;
  temperature?: number;
  preserveEmotion?: boolean;
  language?: 'fr' | 'en';
}

export interface ReformulationResult {
  success: boolean;
  text: string;
  error?: string;
  stats?: {
    originalLength: number;
    reformulatedLength: number;
    charactersSaved?: number;
    processingTime?: number;
  };
}

// Configuration par défaut
const DEFAULT_CONFIG: ReformulationConfig = {
  maxLength: 500,
  temperature: 0.7,
  preserveEmotion: true,
  language: 'fr'
};

// Conseils de reformulation pour le prompt
const REFORMULATION_GUIDELINES = [
  "Respect absolu de la dignité de la personne",
  "Conservation de la voix et du ton original",
  "Pas d'embellissement ni de sensationnalisme",
  "Clarté et concision",
  "Humain, authentique, sans jargon administratif",
  "Éviter les jugements de valeur",
  "Privilégier le récit à la première personne",
  "Sobriété poétique, pas de pathos"
];

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Using process.env.API_KEY and direct initialization as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Reformule un récit brut avec respect et dignité
   */
  async reformulateStory(
    rawStory: string, 
    config: ReformulationConfig = DEFAULT_CONFIG
  ): Promise<ReformulationResult> {
    const startTime = Date.now();
    
    // Validation de l'entrée
    if (!rawStory || rawStory.trim().length < 10) {
      return {
        success: false,
        text: "Le récit est trop court pour être reformulé.",
        error: "Input too short",
        stats: {
          originalLength: rawStory?.length || 0,
          reformulatedLength: 0
        }
      };
    }

    if (rawStory.length > 5000) {
      return {
        success: false,
        text: "Le récit est trop long pour être reformulé automatiquement.",
        error: "Input too long",
        stats: {
          originalLength: rawStory.length,
          reformulatedLength: 0
        }
      };
    }

    try {
      // Construction du prompt optimisé
      const prompt = this.buildReformulationPrompt(rawStory, config);
      
      // Fix: Call ai.models.generateContent directly with model name as per guidelines
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
          maxOutputTokens: 600,
        },
      });
      
      // Fix: Access .text property directly (not a method)
      let reformulatedText = response.text || "";
      
      // Post-traitement
      reformulatedText = this.postProcessText(reformulatedText, config);
      
      // Vérification de la longueur
      if (reformulatedText.length > (config.maxLength || DEFAULT_CONFIG.maxLength!)) {
        reformulatedText = reformulatedText.substring(0, (config.maxLength || DEFAULT_CONFIG.maxLength!)) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        text: reformulatedText,
        stats: {
          originalLength: rawStory.length,
          reformulatedLength: reformulatedText.length,
          charactersSaved: rawStory.length - reformulatedText.length,
          processingTime
        }
      };
      
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      let errorMessage = "Erreur lors de la reformulation.";
      let errorType = "unknown";
      
      // Gestion des erreurs spécifiques
      if (error.message?.includes('API key')) {
        errorMessage = "Clé API invalide ou manquante.";
        errorType = "authentication";
      } else if (error.message?.includes('quota')) {
        errorMessage = "Quota API dépassé. Veuillez réessayer plus tard.";
        errorType = "quota";
      } else if (error.message?.includes('safety')) {
        errorMessage = "Le contenu a été bloqué pour des raisons de sécurité.";
        errorType = "safety";
      } else if (error.message?.includes('network')) {
        errorMessage = "Problème de connexion réseau.";
        errorType = "network";
      }
      
      return {
        success: false,
        text: errorMessage,
        error: errorType,
        stats: {
          originalLength: rawStory.length,
          reformulatedLength: 0,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Construit le prompt pour la reformulation
   */
  private buildReformulationPrompt(rawStory: string, config: ReformulationConfig): string {
    const maxLength = config.maxLength || DEFAULT_CONFIG.maxLength;
    const language = config.language || DEFAULT_CONFIG.language;
    
    const guidelines = REFORMULATION_GUIDELINES.map(g => `- ${g}`).join('\n');
    
    return `Tu es un assistant social écrivain spécialisé dans la reformulation respectueuse de témoignages.

CONTEXTE:
Nous collectons des récits de vie de personnes en situation de précarité. 
Ton rôle est de reformuler ces témoignages pour les rendre accessibles au public tout en préservant la dignité et l'authenticité.

DIRECTIVES STRICTES:
${guidelines}

FORMAT REQUIS:
- Texte en ${language === 'fr' ? 'français' : 'anglais'}
- Maximum ${maxLength} caractères
- Style sobre et poétique
- Phrases courtes et claires
- Préservation des émotions authentiques

RÉCIT BRUT À REFORMULER:
"""
${rawStory}
"""

RÉSULTAT ATTENDU:
Une version reformulée, respectueuse et authentique du récit ci-dessus.`;
  }

  /**
   * Post-traitement du texte généré
   */
  private postProcessText(text: string, config: ReformulationConfig): string {
    let processed = text.trim();
    
    // Supprimer les guillemets qui pourraient encadrer la réponse
    processed = processed.replace(/^["']|["']$/g, '');
    
    // Supprimer les préfixes comme "Réponse:" ou "Reformulation:"
    processed = processed.replace(/^(Réponse|Reformulation|Version|Texte):\s*/i, '');
    
    // Capitaliser la première lettre
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    
    // S'assurer qu'il y a un point à la fin si ce n'est pas le cas
    if (!processed.endsWith('.') && !processed.endsWith('!') && !processed.endsWith('?')) {
      processed += '.';
    }
    
    // Supprimer les espaces multiples
    processed = processed.replace(/\s+/g, ' ');
    
    return processed;
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): boolean {
    return !!process.env.API_KEY;
  }

  /**
   * Version de secours simple (sans IA)
   */
  async fallbackReformulation(rawStory: string): Promise<ReformulationResult> {
    const startTime = Date.now();
    
    // Une reformulation très basique pour la démo
    let reformulated = rawStory
      .split('.')
      .slice(0, 3) // Prendre les 3 premières phrases
      .join('.')
      .substring(0, 300);
    
    if (reformulated.length < rawStory.length && !reformulated.endsWith('.')) {
      reformulated += '...';
    }
    
    return {
      success: true,
      text: reformulated,
      stats: {
        originalLength: rawStory.length,
        reformulatedLength: reformulated.length,
        charactersSaved: rawStory.length - reformulated.length,
        processingTime: Date.now() - startTime
      }
    };
  }

  /**
   * Analyse le texte et retourne des métadonnées utiles
   */
  async analyzeText(text: string): Promise<{
    wordCount: number;
    estimatedReadingTime: number;
    emotion?: string;
    mainTopics?: string[];
  }> {
    try {
      // Fix: Using structured JSON response via responseSchema as per guidelines
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyse ce texte et retourne les métadonnées demandées en respectant le schéma JSON : "${text.substring(0, 1000)}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              wordCount: {
                type: Type.NUMBER,
                description: 'nombre de mots',
              },
              estimatedReadingTime: {
                type: Type.NUMBER,
                description: 'temps de lecture estimé en minutes (arrondi)',
              },
              emotion: {
                type: Type.STRING,
                description: 'émotion dominante (tristesse, espoir, résilience, etc.)',
              },
              mainTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: '3-5 sujets principaux (max 3 mots chacun)',
              },
            },
            required: ["wordCount", "estimatedReadingTime"],
            propertyOrdering: ["wordCount", "estimatedReadingTime", "emotion", "mainTopics"],
          },
        },
      });
      
      const jsonStr = response.text?.trim();
      if (jsonStr) {
        return JSON.parse(jsonStr);
      }
    } catch (error) {
      console.error('Text analysis failed:', error);
    }
    
    return {
      wordCount: text.split(/\s+/).length,
      estimatedReadingTime: Math.ceil(text.split(/\s+/).length / 200)
    };
  }
}

// Singleton pour le service
let geminiInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiInstance) {
    geminiInstance = new GeminiService();
  }
  return geminiInstance;
};

// Fonction d'export principale (rétro-compatibilité)
export const reformulateStory = async (
  rawStory: string, 
  config: ReformulationConfig = DEFAULT_CONFIG
): Promise<string> => {
  const service = getGeminiService();
  
  if (!service.isAvailable()) {
    const fallbackResult = await service.fallbackReformulation(rawStory);
    return fallbackResult.text;
  }
  
  const result = await service.reformulateStory(rawStory, config);
  return result.text;
};

// Fonctions utilitaires
export const validateStoryLength = (story: string): {
  isValid: boolean;
  length: number;
  maxLength: number;
  message?: string;
} => {
  const length = story.length;
  const maxLength = DEFAULT_CONFIG.maxLength || 500;
  
  if (length < 10) {
    return {
      isValid: false,
      length,
      maxLength,
      message: "Le récit est trop court (minimum 10 caractères)"
    };
  }
  
  if (length > 5000) {
    return {
      isValid: false,
      length,
      maxLength,
      message: "Le récit est trop long (maximum 5000 caractères)"
    };
  }
  
  return {
    isValid: true,
    length,
    maxLength
  };
};

export const getReformulationQualityScore = (
  original: string, 
  reformulated: string
): number => {
  const originalLength = original.length;
  const reformulatedLength = reformulated.length;
  
  if (reformulatedLength > 500) return 0;
  
  // Score basé sur la réduction de longueur (idéalement 30-70%)
  const reductionRatio = 1 - (reformulatedLength / originalLength);
  let reductionScore = 0;
  
  if (reductionRatio >= 0.3 && reductionRatio <= 0.7) {
    reductionScore = 100;
  } else if (reductionRatio >= 0.2 && reductionRatio <= 0.8) {
    reductionScore = 80;
  } else {
    reductionScore = Math.max(0, 100 - Math.abs(reductionRatio - 0.5) * 200);
  }
  
  // Pénalité pour les phrases trop longues
  const sentences = (reformulated || "").split(/[.!?]+/);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / (sentences.length || 1);
  let sentenceScore = 100;
  
  if (avgSentenceLength > 150) {
    sentenceScore = 50;
  } else if (avgSentenceLength > 100) {
    sentenceScore = 75;
  }
  
  // Score final (moyenne pondérée)
  return Math.round((reductionScore * 0.6) + (sentenceScore * 0.4));
};

export default getGeminiService;
