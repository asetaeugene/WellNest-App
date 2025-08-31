
// import React from 'react'; (removed, see below)
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- Module Imports ---
// NOTE: This project uses standard browser ES modules with an importmap.
// Path aliases (e.g., "@/") are not supported. All local modules
// must be imported using relative paths (e.g., './' or '../').

import Layout from './components/Layout';
import React, { Suspense, lazy } from 'react';
const JournalPage = lazy(() => import('./pages/JournalPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const QuotesPage = lazy(() => import('./pages/QuotesPage'));
import ProtectedRoute from './components/ProtectedRoute';
import SuccessPage from './pages/SuccessPage';
import { JournalProvider } from './context/JournalContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import { ModalProvider } from './context/ModalContext';
import { OnboardingProvider } from './context/OnboardingContext';
import Onboarding from './components/Onboarding';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/journal" replace />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="insights" element={<InsightsPage />} />
                  <Route path="quotes" element={<QuotesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <JournalProvider>
            <ModalProvider>
              <OnboardingProvider>
                <ThemeProvider>
                  <div className="min-h-screen font-sans">
                    <HashRouter>
                      <Onboarding />
                      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>}>
                        <AnimatedRoutes />
                      </Suspense>
                    </HashRouter>
                  </div>
                </ThemeProvider>
              </OnboardingProvider>
            </ModalProvider>
          </JournalProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;