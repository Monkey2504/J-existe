
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { getProfileByPublicId, saveProfile } from '../services/mockSupabase';
import { reformulateStory } from '../services/geminiService';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Eye, 
  EyeOff,
  MapPin,
  User,
  FileText,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import StoryPreview from '../components/StoryPreview';

const EditProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const isNewProfile = publicId === 'new';
  
  // Fix: Added is_archived and is_verified to satisfy Profile interface
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    raw_story: '',
    reformulated_story: '',
    needs: '',
    usual_place: '',
    is_public: false,
    is_archived: false,
    is_verified: false,
  });
  
  const [loading, setLoading] = useState(!isNewProfile);
  const [isReformulating, setIsReformulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [needsArray, setNeedsArray] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Charger le profil existant
  useEffect(() => {
    const loadProfile = async () => {
      if (!isNewProfile && publicId) {
        try {
          setLoading(true);
          const data = await getProfileByPublicId(publicId);
          if (data) {
            setFormData(data);
            // Convertir les besoins en tableau
            if (data.needs) {
              const parsedNeeds = data.needs.split('\n').filter(n => n.trim());
              setNeedsArray(parsedNeeds);
            }
          }
        } catch (error) {
          console.error('Erreur chargement profil:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
  }, [publicId, isNewProfile]);

  // Gestionnaire de reformulation
  const handleReformulate = useCallback(async () => {
    if (!formData.raw_story?.trim()) {
      setErrors({ raw_story: 'Veuillez saisir un récit avant de reformuler' });
      return;
    }
    
    setIsReformulating(true);
    setErrors({});
    
    try {
      const result = await reformulateStory(formData.raw_story);
      setFormData(prev => ({ 
        ...prev, 
        reformulated_story: result,
        reformulation_date: new Date().toISOString()
      }));
      
      // Afficher un message de succès
      setSuccessMessage('Récit reformulé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur reformulation:', error);
      setErrors({ reformulated_story: 'Erreur lors de la reformulation. Essayez à nouveau.' });
    } finally {
      setIsReformulating(false);
    }
  }, [formData.raw_story]);

  // Gestion des besoins
  const handleNeedsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, needs: value }));
    
    // Mettre à jour le tableau des besoins
    const parsedNeeds = value.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNeedsArray(parsedNeeds);
  }, []);

  // Ajouter un besoin prédéfini
  const addPresetNeed = useCallback((need: string) => {
    const currentNeeds = formData.needs || '';
    const updatedNeeds = currentNeeds 
      ? `${currentNeeds}\n${need}`
      : need;
    
    setFormData(prev => ({ ...prev, needs: updatedNeeds }));
    
    // Mettre à jour le tableau
    setNeedsArray(prev => [...prev, need]);
  }, [formData.needs]);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (!formData.usual_place?.trim()) {
      newErrors.usual_place = 'Le lieu habituel est obligatoire';
    }
    
    if (!formData.raw_story?.trim()) {
      newErrors.raw_story = 'Le récit est obligatoire';
    }
    
    if (formData.raw_story && formData.raw_story.length < 50) {
      newErrors.raw_story = 'Le récit doit contenir au moins 50 caractères';
    }
    
    if (!formData.reformulated_story?.trim()) {
      newErrors.reformulated_story = 'La version reformulée est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Soumission du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setErrors({});
    
    try {
      // Fix: added missing required properties is_archived and is_verified
      const profileToSave: Profile = {
        id: formData.id || `profile_${Date.now()}`,
        publicId: formData.publicId || 
          `${formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`,
        name: formData.name || '',
        raw_story: formData.raw_story || '',
        reformulated_story: formData.reformulated_story || '',
        needs: formData.needs || '',
        usual_place: formData.usual_place || '',
        is_public: formData.is_public || false,
        is_archived: formData.is_archived || false,
        is_verified: formData.is_verified || false,
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveProfile(profileToSave);
      
      setSuccessMessage('Profil enregistré avec succès !');
      
      // Redirection après un délai
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, navigate]);

  // Besoins prédéfinis
  const presetNeeds = useMemo(() => [
    'Duvet/sac de couchage',
    'Chaussures taille 42-44',
    'Vêtements chauds',
    'Produits d\'hygiène',
    'Médicaments',
    'Aide administrative',
    'Trousse de premiers soins',
    'Couverture de survie',
    'Sous-vêtements',
    'Chaussettes épaisses',
    'Bonnet/gants',
    'Eau potable',
    'Nourriture non périssable',
    'Chargeur téléphone',
    'Carte SIM prépayée'
  ], []);

  // Statistiques du récit
  const storyStats = useMemo(() => ({
    rawLength: formData.raw_story?.length || 0,
    reformulatedLength: formData.reformulated_story?.length || 0,
    needsCount: needsArray.length,
    isValid: formData.reformulated_story && formData.reformulated_story.length <= 500
  }), [formData, needsArray]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNewProfile ? 'Créer un nouveau profil' : `Modifier : ${formData.name}`}
              </h1>
              <p className="text-gray-600 mt-2">
                Remplissez les informations avec respect et précision
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {!isNewProfile && formData.publicId && (
                <a
                  href={`/#/p/${formData.publicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir le profil public
                </a>
              )}
              
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Masquer aperçu' : 'Aperçu'}
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        {showPreview && formData.reformulated_story && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du profil public</h2>
            <StoryPreview profile={formData as Profile} />
          </div>
        )}

        {/* Messages d'état */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}
        
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations de base</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nom / Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ex: Jean-Pierre Martin"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Lieu habituel */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lieu habituel *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.usual_place || ''}
                    onChange={e => setFormData({ ...formData, usual_place: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.usual_place ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ex: Place de la Bastille, Paris"
                  />
                </div>
                {errors.usual_place && (
                  <p className="text-sm text-red-600">{errors.usual_place}</p>
                )}
              </div>
            </div>

            {/* Statut de publication */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public || false}
                  onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="flex items-center gap-2 text-gray-700">
                  {formData.is_public ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Profil public</span>
                      <span className="text-sm text-gray-500">(visible sur le site)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Profil privé</span>
                      <span className="text-sm text-gray-500">(visible uniquement en administration)</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Besoins */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Besoins immédiats</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Saisie des besoins */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste des besoins (un par ligne)
                  </label>
                  <textarea
                    value={formData.needs || ''}
                    onChange={handleNeedsChange}
                    rows={8}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder={`Exemple :\n- Duvet chaud\n- Chaussures taille 43\n- Consultation médicale`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {needsArray.length} besoin(s) défini(s)
                    </span>
                    {needsArray.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, needs: '' }));
                          setNeedsArray([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Effacer tout
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Besoins prédéfinis */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ajouter rapidement :
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetNeeds.slice(0, 8).map((need, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addPresetNeed(need)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + {need}
                    </button>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    Exemples de formulation :
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Soins dentaires urgents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Aide pour carte d'identité
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Traduction de documents
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Récit de vie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Récit de vie</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 space-x-4">
                  <span className={storyStats.rawLength < 50 ? 'text-amber-600' : 'text-green-600'}>
                    {storyStats.rawLength} caractères
                  </span>
                  <span className={storyStats.reformulatedLength > 500 ? 'text-red-600' : 'text-green-600'}>
                    {storyStats.reformulatedLength}/500
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleReformulate}
                  disabled={isReformulating || !formData.raw_story?.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isReformulating || !formData.raw_story?.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isReformulating ? 'animate-spin' : ''}`} />
                  {isReformulating ? 'Reformulation...' : 'Reformuler par IA'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Récit brut */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récit brut (notes de l'entretien) *
                  </label>
                  <textarea
                    value={formData.raw_story || ''}
                    onChange={e => setFormData({ ...formData, raw_story: e.target.value })}
                    rows={10}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.raw_story ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm`}
                    placeholder="Saisissez ici les paroles brutes de la personne, telles qu'elles ont été exprimées..."
                  />
                  {errors.raw_story && (
                    <p className="text-sm text-red-600">{errors.raw_story}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Conseil : Notez les mots exacts de la personne, sans interprétation.
                  </div>
                </div>
              </div>

              {/* Version reformulée */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version reformulée (affichée au public) *
                  </label>
                  <textarea
                    value={formData.reformulated_story || ''}
                    onChange={e => setFormData({ ...formData, reformulated_story: e.target.value })}
                    rows={10}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.reformulated_story ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 italic leading-relaxed`}
                    placeholder="Cette version sera affichée publiquement. Elle doit être respectueuse, concise (max 500 caractères) et fidèle à l'esprit du récit original."
                  />
                  {errors.reformulated_story && (
                    <p className="text-sm text-red-600">{errors.reformulated_story}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>Maximum 500 caractères</span>
                    <span className={storyStats.reformulatedLength > 500 ? 'text-red-600' : 'text-green-600'}>
                      {storyStats.reformulatedLength}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conseils de reformulation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Conseils pour une bonne reformulation :</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Respectez la voix et le ton de la personne
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Soyez clair et concis
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Évitez le sensationnalisme
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Conservez la dignité et l'authenticité
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {isNewProfile ? 'Création d\'un nouveau profil' : `Dernière modification : ${
                formData.updated_at 
                  ? new Date(formData.updated_at).toLocaleDateString('fr-FR')
                  : 'Jamais'
              }`}
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isNewProfile ? 'Créer le profil' : 'Enregistrer les modifications'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditProfilePage);
