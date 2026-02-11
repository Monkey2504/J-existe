
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
  ExternalLink,
  Plus,
  Trash2,
  Zap,
  Camera,
  ShieldCheck
} from 'lucide-react';
import StoryPreview from '../components/StoryPreview';
import CameraCapture from '../components/CameraCapture';

interface NeedItem {
  id: string;
  text: string;
  isUrgent: boolean;
}

const EditProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const isNewProfile = publicId === 'new';
  
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    raw_story: '',
    reformulated_story: '',
    needs: '',
    urgent_needs: [],
    usual_place: '',
    is_public: false,
    is_archived: false,
    is_verified: false,
    image_url: ''
  });
  
  const [loading, setLoading] = useState(!isNewProfile);
  const [isReformulating, setIsReformulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [needsList, setNeedsList] = useState<NeedItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!isNewProfile && publicId) {
        try {
          setLoading(true);
          const data = await getProfileByPublicId(publicId);
          if (data) {
            setFormData(data);
            if (data.needs) {
              const parsedNeeds = data.needs.split('\n')
                .filter(n => n.trim())
                .map(n => {
                  const cleanText = n.replace(/^[-\s•]+/, '').trim();
                  return {
                    id: crypto.randomUUID(),
                    text: cleanText,
                    isUrgent: data.urgent_needs?.includes(cleanText) || false
                  };
                });
              setNeedsList(parsedNeeds);
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

  const handleReformulate = useCallback(async () => {
    if (!formData.raw_story?.trim()) {
      setErrors({ raw_story: 'Veuillez saisir un récit avant de reformuler' });
      return;
    }
    setIsReformulating(true);
    setErrors({});
    try {
      const result = await reformulateStory(formData.raw_story);
      setFormData(prev => ({ ...prev, reformulated_story: result }));
      setSuccessMessage('Récit reformulé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur reformulation:', error);
      setErrors({ reformulated_story: 'Erreur lors de la reformulation.' });
    } finally {
      setIsReformulating(false);
    }
  }, [formData.raw_story]);

  const updateNeedsFromList = (list: NeedItem[]) => {
    const needsString = list.map(n => `- ${n.text}`).join('\n');
    const urgentArray = list.filter(n => n.isUrgent).map(n => n.text);
    setFormData(prev => ({ ...prev, needs: needsString, urgent_needs: urgentArray }));
  };

  const addNeed = useCallback((text: string = '') => {
    const newList = [...needsList, { id: crypto.randomUUID(), text, isUrgent: false }];
    setNeedsList(newList);
    updateNeedsFromList(newList);
  }, [needsList]);

  const removeNeed = (id: string) => {
    const newList = needsList.filter(n => n.id !== id);
    setNeedsList(newList);
    updateNeedsFromList(newList);
  };

  const toggleUrgency = (id: string) => {
    const newList = needsList.map(n => n.id === id ? { ...n, isUrgent: !n.isUrgent } : n);
    setNeedsList(newList);
    updateNeedsFromList(newList);
  };

  const updateNeedText = (id: string, text: string) => {
    const newList = needsList.map(n => n.id === id ? { ...n, text } : n);
    setNeedsList(newList);
    updateNeedsFromList(newList);
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!formData.usual_place?.trim()) newErrors.usual_place = 'Le lieu habituel est obligatoire';
    if (!formData.raw_story?.trim()) newErrors.raw_story = 'Le récit est obligatoire';
    if (!formData.reformulated_story?.trim()) newErrors.reformulated_story = 'La reformulation est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const profileToSave: Profile = {
        ...formData,
        id: formData.id || `profile_${Date.now()}`,
        publicId: formData.publicId || `${formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`,
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile;
      await saveProfile(profileToSave);
      setSuccessMessage('Profil enregistré avec succès !');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setErrors({ submit: 'Erreur lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, navigate]);

  const presetNeeds = useMemo(() => [
    'Duvet chaud',
    'Chaussures (42-44)',
    'Vêtements de pluie',
    'Produits d\'hygiène',
    'Abonnement STIB',
    'Aide administrative',
    'Trousse de secours',
    'Chargeur téléphone'
  ], []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-stone-900" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 mb-6 font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Retour Dashboard
          </button>
          <div className="flex items-end justify-between">
            <h1 className="text-6xl font-impact text-stone-900 uppercase">{isNewProfile ? 'Nouveau Visage' : 'Modification'}</h1>
            <button 
              type="button" 
              onClick={() => setShowPreview(!showPreview)} 
              className="px-6 py-2 border-2 border-stone-900 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all"
            >
              {showPreview ? 'Masquer Aperçu' : 'Aperçu Direct'}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="mb-12">
            <StoryPreview profile={formData as Profile} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section Identité & Photo */}
          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-10">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Camera Widget */}
              <div className="relative group shrink-0">
                 <div className="w-40 h-40 rounded-[2.5rem] bg-stone-50 border-2 border-stone-100 overflow-hidden relative flex items-center justify-center">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Portrait" className="w-full h-full object-cover grayscale" />
                    ) : (
                      <User className="w-12 h-12 text-stone-200" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => setShowCamera(true)}
                      className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 flex-col"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Prendre</span>
                    </button>
                 </div>
                 {formData.image_url && (
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, image_url: ''})}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-stone-100 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Identité</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-2xl font-serif italic border-b border-stone-100 focus:border-stone-900 outline-none pb-2"
                    placeholder="Ex: Jean de Molenbeek"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Lieu habituel (Bruxelles)</label>
                  <input
                    type="text"
                    value={formData.usual_place || ''}
                    onChange={e => setFormData({ ...formData, usual_place: e.target.value })}
                    className="w-full text-xl font-serif border-b border-stone-100 focus:border-stone-900 outline-none pb-2"
                    placeholder="Ex: Place Sainte-Catherine, Bruxelles"
                  />
                  {errors.usual_place && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.usual_place}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-stone-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public || false}
                  onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-200 text-stone-900 focus:ring-stone-900"
                />
                <label htmlFor="is_public" className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 cursor-pointer">Rendre ce profil public</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified || false}
                  onChange={e => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-200 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="is_verified" className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2 cursor-pointer">
                  <ShieldCheck className="w-4 h-4" />
                  Existence Vérifiée par le social
                </label>
              </div>
            </div>
          </div>

          {/* Section Récit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Récit Brut (Notes de terrain)</h2>
                <button type="button" onClick={handleReformulate} disabled={isReformulating} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> {isReformulating ? 'Analyse Gemini...' : 'Reformuler par IA'}
                </button>
              </div>
              <textarea
                value={formData.raw_story || ''}
                onChange={e => setFormData({ ...formData, raw_story: e.target.value })}
                rows={8}
                className="w-full bg-stone-50 rounded-2xl p-6 text-sm font-mono border-none focus:ring-2 focus:ring-stone-900"
                placeholder="Détails biographiques, raisons de la chute, quotidien..."
              />
              {errors.raw_story && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.raw_story}</p>}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Récit Reformulé (Version Publique)</h2>
              <textarea
                value={formData.reformulated_story || ''}
                onChange={e => setFormData({ ...formData, reformulated_story: e.target.value })}
                rows={8}
                className="w-full bg-white rounded-2xl p-6 text-lg font-serif italic border border-stone-100 focus:ring-2 focus:ring-stone-900"
                placeholder="La version synthétisée et digne..."
              />
              {errors.reformulated_story && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.reformulated_story}</p>}
            </div>
          </div>

          {/* Section Besoins & Urgence */}
          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Besoins Réels & Priorités</h2>
              <button type="button" onClick={() => addNeed()} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                <Plus className="w-3 h-3" /> Ajouter un besoin
              </button>
            </div>

            <div className="space-y-4">
              {needsList.length === 0 && (
                <p className="text-stone-400 font-serif italic text-center py-8">Aucun besoin listé pour le moment.</p>
              )}
              {needsList.map((need) => (
                <div key={need.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${need.isUrgent ? 'bg-amber-50 border-2 border-amber-200 shadow-sm' : 'bg-stone-50 border border-stone-100'}`}>
                  <button 
                    type="button" 
                    onClick={() => toggleUrgency(need.id)}
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${need.isUrgent ? 'bg-amber-500 text-white' : 'bg-white text-stone-300 hover:text-amber-500'}`}
                    title={need.isUrgent ? "Marqué comme urgent" : "Marquer comme urgent"}
                  >
                    <Zap className={`w-5 h-5 ${need.isUrgent ? 'fill-white' : ''}`} />
                  </button>
                  <input
                    type="text"
                    value={need.text}
                    onChange={e => updateNeedText(need.id, e.target.value)}
                    placeholder="Désignation du besoin..."
                    className="flex-1 bg-transparent border-none outline-none font-serif text-lg text-stone-800"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeNeed(need.id)}
                    className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-stone-50 pt-8">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-stone-300">Suggestions rapides</h3>
              <div className="flex flex-wrap gap-2">
                {presetNeeds.map(n => (
                  <button 
                    key={n} 
                    type="button" 
                    onClick={() => addNeed(n)} 
                    className="px-4 py-2 bg-stone-50 text-stone-400 rounded-full text-[9px] font-bold hover:bg-stone-200 hover:text-stone-900 transition-all uppercase tracking-widest"
                  >
                    + {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-10 pt-10">
            {successMessage && <span className="text-green-600 font-bold text-xs uppercase tracking-widest animate-fade-in">{successMessage}</span>}
            <button type="button" onClick={() => navigate('/admin')} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900">Annuler</button>
            <button type="submit" disabled={isSaving} className="px-12 py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl flex items-center gap-3">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Synchronisation...' : 'Fixer l\'existence'}
            </button>
          </div>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture 
          onCapture={(img) => setFormData({...formData, image_url: img})} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default React.memo(EditProfilePage);
