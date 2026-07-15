import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MchatPage from './pages/MchatPage';
import FollowUpPage from './pages/FollowUpPage';
import PragmaticsPage from './pages/PragmaticsPage';
import AnamnesePage from './pages/AnamnesePage';
import BambiPage from './pages/BambiPage';
import CaaPage from './pages/CaaPage';
import ReportPage from './pages/ReportPage';
import VocabularyPage from './pages/VocabularyPage';
import FluencyPage from './pages/FluencyPage';
import PhonologyPage from './pages/PhonologyPage';
import VoicePage from './pages/VoicePage';
import ReceptiveLanguagePage from './pages/ReceptiveLanguagePage';
import OrofacialMotorPage from './pages/OrofacialMotorPage';
import PhonologicalAwarenessPage from './pages/PhonologicalAwarenessPage';

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
  }, []);

  useEffect(() => {
    if (isGuestMode) {
      initGuestMode();
    }
  }, [isGuestMode]);

  return (
    <BrowserRouter>
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
          <Route path="/voice/:patientId" element={<VoicePage />} />
          <Route path="/receptive_language/:patientId" element={<ReceptiveLanguagePage />} />
          <Route path="/orofacial_motor/:patientId" element={<OrofacialMotorPage />} />
          <Route path="/phonological_awareness/:patientId" element={<PhonologicalAwarenessPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
