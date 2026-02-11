import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Home, 
  Heart, 
  Shield,
  Package,
  MapPin,
  Calendar,
  Share2,
  Printer,
  MessageCircle,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';
import { getProfileByPublicId, incrementProfileView } from '../services/mockSupabase';

interface ProfilDetail {
  id: string;
  publicId: string;
  nom: string;
  recit_brut: string;
  recit_reformule: string;
  besoins_immediats: string[];
  lieu_habituel: string;
  a_logement: boolean;
  activer_dons: boolean;
  created_at: string;
  updated_at?: string;
  contact_phone?: string;
  contact_email?: string;
  urgent_priority?: boolean;
}

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [profil, setProfil] = useState<ProfilDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawStory, setShowRawStory] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [views, setViews] = useState(0);
  const [activeNeed, setActiveNeed] = useState<number | null>(null);

  const fetchProfil = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Données de démonstration - à remplacer par l'appel réel
      const mockData: ProfilDetail = {
        id: '1',
        publicId: publicId || 'jean-martin',
        nom: 'Jean Martin',
        recit_brut: "J'étais artisan ébéniste depuis 25 ans. Mon atelier était à Montreuil. Après le décès de ma femme et la perte de mon atelier suite à un incendie, j'ai tout perdu. Je dors actuellement dans ma voiture mais elle va bientôt être saisie. Je cherche du travail dans le bâtiment ou la menuiserie. Je parle anglais et j'ai de bonnes compétences en soudure aussi.",
        recit_reformule: "Ancien artisan ébéniste pendant 25 ans. Après des difficultés personnelles et la perte de mon atelier, je me retrouve sans logement. Je cherche à retrouver une activité professionnelle dans le bâtiment. Compétent en menuiserie et soudure.",
        besoins_immediats: [
          'Chaussures de sécurité taille 42',
          'Couverture chaude et sac de couchage',
          'Trousse de toilette complète',
          'Aide pour papiers administratifs',
          'Consultation médicale générale',
          'Trousse à outils de base',
          'Vêtements professionnels'
        ],
        lieu_habituel: 'Gare Saint-Charles, Marseille',
        a_logement: true,
        activer_dons: true,
        created_at: '2024-01-15',
        updated_at: '2024-03-20',
        contact_phone: '+33 6 12 34 56 78',
        urgent_priority: true
      };
      
      setProfil(mockData);
      
      // Simuler l'incrémentation des vues
      await incrementProfileView(mockData.id);
      setViews(prev => prev + 1);
      
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setError('Impossible de charger le profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    if (publicId) {
      fetchProfil();
    }
  }, [publicId, fetchProfil]);

  const handleDownloadQR = useCallback(async () => {
    try {
      setDownloading(true);
      const svg = document.getElementById('qr-code-svg');
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `qr-jexiste-${publicId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          resolve(null);
        };
        
        img.onerror = reject;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });
      
      setDownloading(false);
    } catch (error) {
      console.error('Erreur téléchargement QR:', error);
      setDownloading(false);
    }
  }, [publicId]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/#/p/${publicId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Erreur copie:', err));
  }, [publicId]);

  const handleShare = useCallback(() => {
    if (navigator.share && profil) {
      navigator.share({
        title: `Profil de ${profil.nom} - J'existe`,
        text: `Découvrez l'histoire de ${profil.nom}`,
        url: `${window.location.origin}/#/p/${profil.publicId}`,
      });
    } else {
      setShowShareOptions(true);
    }
  }, [profil]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleNeedClick = useCallback((index: number) => {
    setActiveNeed(activeNeed === index ? null : index);
  }, [activeNeed]);

  const profileUrl = useMemo(() => 
    `${window.location.origin}/#/p/${publicId}`, 
    [publicId]
  );

  const shareData = useMemo(() => ({
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez l'histoire de ${profil?.nom} sur J'existe`)}&url=${encodeURIComponent(profileUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${profil?.nom} - ${profileUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(`Profil de ${profil?.nom}`)}&body=${encodeURIComponent(`Découvrez ce profil : ${profileUrl}`)}`
  }), [profil, profileUrl]);

  const urgencyColor = useMemo(() => 
    profil?.urgent_priority ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100',
    [profil]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  if (error || !profil) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-8"
      >
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {error || 'Profil non trouvé'}
          </h2>
          <p className="text-gray-500 mb-6">
            Ce profil n'existe pas ou n'est plus accessible.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/profiles"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux profils
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/profiles"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Retour aux profils</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Mis à jour le {new Date(profil.updated_at || profil.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Imprimer"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Partager"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête avec QR Code et informations */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Code Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-block p-4 bg-white border-2 border-dashed border-blue-200 rounded-3xl"
                >
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={profileUrl}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#1e40af"
                  />
                </motion.div>
                
                <h1 className="text-4xl font-bold mt-6 mb-2 text-gray-900">
                  {profil.nom}
                </h1>
                
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{profil.lieu_habituel}</span>
                </div>
                
                {profil.urgent_priority && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                    <AlertCircle className="w-4 h-4" />
                    Situation urgente
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadQR}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        QR Code
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Lien
                      </>
                    )}
                  </motion.button>
                  
                  <button
                    onClick={() => setShowRawStory(!showRawStory)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    {showRawStory ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Masquer version brute
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Version brute
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Informations de contact et statistiques */}
            <div className="lg:col-span-2">
              <div className={`${urgencyColor} rounded-2xl border p-6 h-full`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact et coordination
                    </h3>
                    <div className="space-y-3">
                      {profil.contact_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <a 
                              href={`tel:${profil.contact_phone}`}
                              className="text-gray-900 hover:text-blue-600"
                            >
                              {profil.contact_phone}
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Suivi par</p>
                          <p className="text-gray-900">Travailleur social référent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Statut du profil
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Visibilité</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${profil.activer_dons ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-900">
                            {profil.activer_dons ? 'Actif - Accepte les dons' : 'En attente'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Logement d'urgence</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${profil.a_logement ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-900">
                            {profil.a_logement ? 'Disponible' : 'Non disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Ce profil est géré par des travailleurs sociaux professionnels.
                    Pour toute aide directe, merci de passer par les canaux officiels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Récit de vie */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Son histoire</h2>
            </div>
            <div className="text-sm text-gray-500">
              {profil.recit_reformule.length}/500 caractères
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <AnimatePresence mode="wait">
                {showRawStory ? (
                  <motion.div
                    key="raw"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Version brute - Notes d'entretien
                      </div>
                      <p className="text-yellow-700 text-sm">
                        Ce texte n'est pas destiné à être partagé publiquement.
                        Il contient les notes brutes de l'entretien.
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {profil.recit_brut}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reformulated"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-gray-700 leading-relaxed text-lg italic">
                      "{profil.recit_reformule}"
                    </p>
                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Shield className="w-4 h-4" />
                        <span>Récit reformulé avec respect et éthique</span>
                      </div>
                      <button
                        onClick={() => setShowRawStory(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir la version brute
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Besoins immédiats */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-green-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Besoins immédiats</h2>
            </div>
            <span className="text-sm text-gray-500">
              {profil.besoins_immediats.length} besoin(s) identifié(s)
            </span>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profil.besoins_immediats.map((besoin, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleNeedClick(index)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeNeed === index 
                      ? 'bg-green-50 border-green-200 shadow-md' 
                      : 'bg-white border-gray-100 hover:border-green-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeNeed === index ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        activeNeed === index ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        activeNeed === index ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {besoin}
                      </h3>
                      {activeNeed === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 pt-2 border-t border-green-100"
                        >
                          <p className="text-sm text-green-700">
                            Pour répondre à ce besoin, contactez un travailleur social.
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      activeNeed === index ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activeNeed === index ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-100"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                  <span className="font-semibold">Proposer mon aide</span>
                </motion.button>
                <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
                  Pour coordonner votre aide, merci de contacter d'abord un travailleur social
                  via les informations de contact ci-dessus.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Modules optionnels */}
        {profil.a_logement && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    🏠 Hébergement d'urgence disponible
                  </h3>
                  <p className="text-blue-700">
                    Des places sont disponibles dans nos structures partenaires.
                    Contactez le référent pour plus d'informations.
                  </p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap">
                  Voir les disponibilités
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {profil.activer_dons && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    💝 Soutien financier direct
                  </h3>
                  <p className="text-purple-700">
                    Vous pouvez contribuer directement aux besoins de {profil.nom}
                    via notre plateforme sécurisée de dons.
                  </p>
                </div>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold whitespace-nowrap">
                  Faire un don
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Modal de partage */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Partager ce profil
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <a
                    href={shareData.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                  >
                    <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-sm font-medium">Twitter</span>
                  </a>
                  <a
                    href={shareData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                  >
                    <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  <a
                    href={shareData.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"
                  >
                    <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88z"/>
                    </svg>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href={shareData.email}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100"
                  >
                    <Mail className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 italic mb-2">
            "Chaque personne a une histoire. Chaque histoire mérite d'être entendue."
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/" className="text-gray-400 hover:text-gray-600">
              <Home className="w-5 h-5" />
            </Link>
            <Link to="/profiles" className="text-gray-400 hover:text-gray-600">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <div className="text-gray-400 text-sm">
              #Jexiste
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(ProfileDetailPage);