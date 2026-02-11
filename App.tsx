
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import PageTransition from './components/animations/PageTransition.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Lazy loading explicite avec extensions .tsx
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const ProfilesListingPage = lazy(() => import('./pages/ProfilesListingPage.tsx'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.tsx'));

// Protection de route
const RequireAuth: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingOverlay message="Vérification d'accès..." />;
  }
  
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/" 
        replace 
        state={{ from: location }} 
      />
    );
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  
  return (
    <ErrorBoundary>
      <PageTransition>
        <Suspense fallback={<LoadingOverlay message="Chargement..." showSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profiles" element={<ProfilesListingPage />} />
            <Route path="/profiles/:lieu" element={<ProfilesListingPage />} />
            <Route path="/p/:publicId" element={<ProfileDetailPage />} />
            
            <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/new" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
            <Route path="/admin/edit/:publicId" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppContent />
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
