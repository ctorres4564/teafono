import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MchatPage = lazy(() => import('./pages/MchatPage'));
const FollowUpPage = lazy(() => import('./pages/FollowUpPage'));
const PragmaticsPage = lazy(() => import('./pages/PragmaticsPage'));
const AnamnesePage = lazy(() => import('./pages/AnamnesePage'));
const BambiPage = lazy(() => import('./pages/BambiPage'));
const CaaPage = lazy(() => import('./pages/CaaPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'));
const FluencyPage = lazy(() => import('./pages/FluencyPage'));
const PhonologyPage = lazy(() => import('./pages/PhonologyPage'));

function RouteLoadingFallback() {
  return (
    <div style={{ minHeight: '50vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '4px solid var(--secondary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

function AuthGuard({ children }) {
  const { currentUser, isGuestMode, authLoading } = useStore();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', width: '100%', display: 'flex',
        justifyContent: 'center', alignItems: 'center',
        background: '#0b0f19', color: '#fff', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--secondary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Carregando dados com segurança...</span>
      </div>
    );
  }

  if (!currentUser && !isGuestMode) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function GuestGuard({ children }) {
  const { currentUser, isGuestMode, authLoading } = useStore();

  if (authLoading) return null;
  if (currentUser || isGuestMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { loadFromLocalStorage, initAuth, initGuestMode, isGuestMode } = useStore();

  useEffect(() => {
    loadFromLocalStorage();
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
    // loadFromLocalStorage/initAuth são ações estáveis do Zustand (mesma referência sempre);
    // seguras nas deps sem reexecutar o efeito a cada render.
  }, [loadFromLocalStorage, initAuth]);

  useEffect(() => {
    if (isGuestMode) {
      initGuestMode();
    }
  }, [isGuestMode, initGuestMode]);

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          } />
          <Route element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mchat/:patientId" element={<MchatPage />} />
            <Route path="/followup/:patientId" element={<FollowUpPage />} />
            <Route path="/pragmatics/:patientId" element={<PragmaticsPage />} />
            <Route path="/anamnese/:patientId/:entryId?" element={<AnamnesePage />} />
            <Route path="/bambi/:patientId" element={<BambiPage />} />
            <Route path="/caa/:patientId" element={<CaaPage />} />
            <Route path="/report/:patientId/:reportId" element={<ReportPage />} />
            <Route path="/vocabulary/:patientId" element={<VocabularyPage />} />
            <Route path="/fluency/:patientId/:mode" element={<FluencyPage />} />
            <Route path="/phonology/:patientId" element={<PhonologyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
