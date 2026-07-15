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

    const routeMap = {
      anamnese: 'anamnese',
      mchat: 'mchat',
      pragmatics: 'pragmatics',
      bambi: 'bambi',
      vocabulary: 'vocabulary',
      fluency_verbal: 'fluency/verbal',
      fluency_speech: 'fluency/speech',
      phonology: 'phonology',
      voice: 'voice',
    };

    const route = routeMap[moduleName];
    if (route) {
      navigate(`/${route}/${active.id}`);
    } else {
      navigate(`/${moduleName}/${active.id}`);
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

  const handleEditAssessment = (moduleName, entryId) => {
    const active = useStore.getState().getActivePatient();
    if (!active) return;
    navigate(`/${moduleName}/${active.id}/${entryId}`);
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
      onEditAssessment={handleEditAssessment}
    />
  );
}
