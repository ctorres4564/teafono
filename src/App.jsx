import React, { useState, useEffect } from 'react';
import { mockTeaPatients } from './utils/teaEvaluations';
import { 
  isFirebaseEnabled, 
  savePatientToFirestore, 
  deletePatientFromFirestore, 
  loadPatientsFromFirestore 
} from './firebase';
import Dashboard from './components/Dashboard';
import MchatModule from './components/MchatModule';
import PragmaticsModule from './components/PragmaticsModule';
import BambiModule from './components/BambiModule';
import ComunicaTeaModule from './components/ComunicaTeaModule';
import ReportModule from './components/ReportModule';
import TherapistSettings from './components/TherapistSettings';
import { Sun, Moon, Compass, Heart, Award, Settings } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'dashboard' | 'mchat' | 'pragmatics' | 'bambi' | 'caa' | 'report'
  const [activePatient, setActivePatient] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [therapistSettings, setTherapistSettings] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Carrega pacientes iniciais de forma híbrida (Firestore ou localStorage)
  useEffect(() => {
    async function initData() {
      if (isFirebaseEnabled()) {
        const firestoreList = await loadPatientsFromFirestore();
        if (firestoreList && firestoreList.length > 0) {
          setPatients(firestoreList);
          localStorage.setItem('teafono_patients', JSON.stringify(firestoreList));
          return;
        }
      }

      const stored = localStorage.getItem('teafono_patients');
      if (stored) {
        setPatients(JSON.parse(stored));
      } else {
        localStorage.setItem('teafono_patients', JSON.stringify(mockTeaPatients));
        setPatients(mockTeaPatients);
      }
    }

    initData();

    const storedSettings = localStorage.getItem('teafono_therapist_settings');
    if (storedSettings) {
      setTherapistSettings(JSON.parse(storedSettings));
    }

    const storedTheme = localStorage.getItem('teafono_theme');
    if (storedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isLightMode;
    setIsLightMode(nextTheme);
    if (nextTheme) {
      document.body.classList.add('light-mode');
      localStorage.setItem('teafono_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('teafono_theme', 'dark');
    }
  };

  const savePatientsToStorage = (updatedList) => {
    setPatients(updatedList);
    localStorage.setItem('teafono_patients', JSON.stringify(updatedList));

    // Sincronização em segundo plano no Firestore
    if (isFirebaseEnabled()) {
      updatedList.forEach(async (patient) => {
        await savePatientToFirestore(patient);
      });
    }
  };

  const handleSelectPatient = (patient) => {
    const updated = patients.map(p => ({
      ...p,
      isSelected: p.id === patient.id
    }));
    setActivePatient(patient);
    savePatientsToStorage(updated);
  };

  // Cadastro livre de race conditions
  const handleAddPatient = (newPatData) => {
    const newPat = {
      id: 'tp_' + Date.now(),
      name: newPatData.name,
      age: newPatData.age,
      gender: newPatData.gender,
      diagnosis: newPatData.diagnosis,
      birthDate: newPatData.birthDate,
      speechComplaint: newPatData.speechComplaint,
      createdAt: new Date().toISOString(),
      history: [],
      isSelected: true
    };
    
    const updated = [newPat, ...patients.map(p => ({ ...p, isSelected: false }))];
    setActivePatient(newPat);
    savePatientsToStorage(updated);
  };

  const handleDeletePatient = (id) => {
    if (window.confirm("Deseja realmente remover esta ficha e todo o histórico clínico desta criança?")) {
      const updated = patients.filter(p => p.id !== id);
      if (activePatient && activePatient.id === id) {
        setActivePatient(null);
      }
      savePatientsToStorage(updated);

      // Deleta do Firestore
      if (isFirebaseEnabled()) {
        deletePatientFromFirestore(id);
      }
    }
  };

  const handleUpdatePatient = (updatedPatData) => {
    const updated = patients.map(p => {
      if (p.id === updatedPatData.id) {
        return {
          ...p,
          name: updatedPatData.name,
          age: updatedPatData.age,
          gender: updatedPatData.gender,
          diagnosis: updatedPatData.diagnosis,
          birthDate: updatedPatData.birthDate,
          speechComplaint: updatedPatData.speechComplaint
        };
      }
      return p;
    });

    const activeCopy = updated.find(p => p.id === updatedPatData.id);
    if (activeCopy) {
      setActivePatient(activeCopy);
    }
    savePatientsToStorage(updated);
  };

  const handleSaveSettings = (settings) => {
    setTherapistSettings(settings);
    localStorage.setItem('teafono_therapist_settings', JSON.stringify(settings));
    setShowSettingsModal(false);
  };

  const handleImportBackupList = (importedList) => {
    if (!Array.isArray(importedList)) return;
    if (window.confirm(`Você está prestes a importar ${importedList.length} fichas de pacientes. Isso substituirá as fichas locais atuais. Deseja continuar?`)) {
      const resetList = importedList.map((p, idx) => ({
        ...p,
        isSelected: idx === 0
      }));
      if (resetList.length > 0) {
        setActivePatient(resetList[0]);
      } else {
        setActivePatient(null);
      }
      savePatientsToStorage(resetList);
    }
  };

  const handleStartAssessment = (moduleName) => {
    const currentActive = patients.find(p => p.isSelected);
    if (!currentActive) return;
    setActivePatient(currentActive);
    setActiveScreen(moduleName);
  };

  // Salvar avaliação finalizada e direcionar ao laudo
  const handleSaveAssessmentResults = (moduleName, results) => {
    const patientIndex = patients.findIndex(p => p.id === activePatient.id);
    if (patientIndex === -1) return;

    const patientCopy = { ...patients[patientIndex] };
    const dateStr = new Date().toISOString();
    const evalId = 'teval_' + Date.now();

    const newHistoryEntry = {
      id: evalId,
      date: dateStr,
      results: {
        [moduleName]: results
      }
    };

    patientCopy.history = [newHistoryEntry, ...patientCopy.history];
    
    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = patientCopy;

    savePatientsToStorage(updatedPatients);
    setActivePatient(patientCopy);

    // Abre o Laudo correspondente
    setActiveReportId(evalId);
    setActiveScreen('report');
  };

  const handleViewReport = (reportId) => {
    const currentActive = patients.find(p => p.isSelected);
    setActivePatient(currentActive);
    setActiveReportId(reportId);
    setActiveScreen('report');
  };

  const handleGoToCaa = () => {
    const currentActive = patients.find(p => p.isSelected);
    if (!currentActive) return;
    setActivePatient(currentActive);
    setActiveScreen('caa');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Header Fixo */}
      <header className="app-header no-print">
        <div className="brand">
          <Heart size={28} style={{ color: 'var(--secondary-color)', fill: 'rgba(139,92,246,0.1)' }} />
          <span>TeaFono</span>
        </div>

        <div className="header-actions">
          {activePatient && activeScreen === 'dashboard' && (
            <button className="btn btn-secondary" onClick={handleGoToCaa} style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>
              🗣️ Comunicação Alternativa
            </button>
          )}
          <button className="btn btn-secondary btn-icon" onClick={() => setShowSettingsModal(true)} title="Configurações do Profissional">
            <Settings size={18} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Alternar tema">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="app-container">
        {activeScreen === 'dashboard' && (
          <Dashboard 
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
            onUpdatePatient={handleUpdatePatient}
            onImportBackup={handleImportBackupList}
            onStartAssessment={handleStartAssessment}
            onViewReport={handleViewReport}
            onGoToCaa={handleGoToCaa}
          />
        )}

        {activeScreen === 'mchat' && activePatient && (
          <div className="glass-panel card" style={{ padding: '2rem' }}>
            <MchatModule 
              patient={activePatient}
              onBack={() => setActiveScreen('dashboard')}
              onSaveAssessment={handleSaveAssessmentResults}
            />
          </div>
        )}

        {activeScreen === 'pragmatics' && activePatient && (
          <div className="glass-panel card" style={{ padding: '2rem' }}>
            <PragmaticsModule 
              patient={activePatient}
              onBack={() => setActiveScreen('dashboard')}
              onSaveAssessment={handleSaveAssessmentResults}
            />
          </div>
        )}

        {activeScreen === 'bambi' && activePatient && (
          <div className="glass-panel card" style={{ padding: '2rem' }}>
            <BambiModule 
              patient={activePatient}
              onBack={() => setActiveScreen('dashboard')}
              onSaveAssessment={handleSaveAssessmentResults}
            />
          </div>
        )}

        {activeScreen === 'caa' && activePatient && (
          <div className="glass-panel card" style={{ padding: '2.5rem 2rem' }}>
            <ComunicaTeaModule 
              patient={activePatient}
              onBack={() => setActiveScreen('dashboard')}
            />
          </div>
        )}

        {activeScreen === 'report' && activePatient && activeReportId && (
          <ReportModule 
            patient={activePatient}
            assessmentId={activeReportId}
            therapistSettings={therapistSettings}
            onBack={() => setActiveScreen('dashboard')}
          />
        )}
      </main>

      {showSettingsModal && (
        <TherapistSettings 
          settings={therapistSettings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
