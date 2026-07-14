import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import useStore from '../store/useStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    patients,
    activePatientId,
    selectPatient,
    addPatient,
    deletePatient,
    updatePatient,
    importBackupList,
  } = useStore();

  const handleStartAssessment = (moduleName) => {
    const active = useStore.getState().getActivePatient();
    if (!active) return;

    if (moduleName === 'fluency_verbal' || moduleName === 'fluency_speech') {
      const mode = moduleName === 'fluency_verbal' ? 'verbal' : 'speech';
      navigate(`/fluency/${active.id}/${mode}`);
      return;
    }

    const routeMap = {
      mchat: 'mchat',
      pragmatics: 'pragmatics',
      bambi: 'bambi',
      vocabulary: 'vocabulary',
      phonology: 'phonology',
    };

    const route = routeMap[moduleName];
    if (route) {
      navigate(`/${route}/${active.id}`);
    }
  };

  const handleViewReport = (reportId) => {
    const state = useStore.getState();
    state.viewReport(reportId);
    const active = state.getActivePatient();
    if (!active) return;
    navigate(`/report/${active.id}/${reportId}`);
  };

  const handleGoToCaa = () => {
    const active = useStore.getState().getActivePatient();
    if (!active) return;
    navigate(`/caa/${active.id}`);
  };

  return (
    <Dashboard
      patients={patients}
      activePatientId={activePatientId}
      onSelectPatient={(p) => selectPatient(p)}
      onAddPatient={(data) => addPatient(data)}
      onDeletePatient={(id) => deletePatient(id)}
      onUpdatePatient={(data) => updatePatient(data)}
      onImportBackup={(list) => importBackupList(list)}
      onStartAssessment={handleStartAssessment}
      onViewReport={handleViewReport}
      onGoToCaa={handleGoToCaa}
    />
  );
}
