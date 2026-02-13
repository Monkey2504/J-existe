import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import PageTransition from './components/animations/PageTransition.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Lazy loading des composants pour optimiser le temps de chargement initial
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const ProfilesListingPage = lazy(() => import('./pages/ProfilesListingPage.tsx'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.tsx'));
const QuestionnairePage = lazy(() => import('./pages/QuestionnairePage.tsx'));

// Pages ressources
const FAQPage = lazy(() => import('./pages/FAQPage.tsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'));
const PartnersPage = lazy(() => import('./pages/PartnersPage.tsx'));

/**
 * Composant utilitaire pour remonter en haut de page lors d'un changement de route
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  
  return (
    <PageTransition>
      <ScrollToTop />
      <Suspense fallback={<LoadingOverlay message="Accès au registre..." showSpinner />}>
        <Routes location={location}>
          {/* Routes Publiques Principales */}
          <Route path="/" element={<HomePage />} />
          <Route path="/profiles" element={<ProfilesListingPage />} />
          <Route path="/p/:publicId" element={<ProfileDetailPage />} />
          <Route path="/je-cree-ma-fiche" element={<QuestionnairePage />} />
          
          {/* Ressources & Informations */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          
          {/* Administration (Pense à protéger ces routes via AuthContext plus tard) */}
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="new" element={<EditProfilePage />} />
            <Route path="edit/:publicId" element={<EditProfilePage />} />
          </Route>
          
          {/* Redirection automatique pour les pages inexistantes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Layout>
            <AppContent />
          </Layout>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;