
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import PageTransition from './components/animations/PageTransition.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Lazy loading
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const ProfilesListingPage = lazy(() => import('./pages/ProfilesListingPage.tsx'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.tsx'));
const QuestionnairePage = lazy(() => import('./pages/QuestionnairePage.tsx'));

// Nouvelles pages ressources
const FAQPage = lazy(() => import('./pages/FAQPage.tsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'));
const PartnersPage = lazy(() => import('./pages/PartnersPage.tsx'));

const AppContent: React.FC = () => {
  const location = useLocation();
  
  return (
    <PageTransition>
      <Suspense fallback={<LoadingOverlay message="Accès au registre..." showSpinner />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profiles" element={<ProfilesListingPage />} />
          <Route path="/p/:publicId" element={<ProfileDetailPage />} />
          
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          
          <Route path="/je-cree-ma-fiche" element={<QuestionnairePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<EditProfilePage />} />
          <Route path="/admin/edit/:publicId" element={<EditProfilePage />} />
          
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
