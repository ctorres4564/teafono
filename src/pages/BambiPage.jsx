import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BambiModule from '../components/BambiModule';
import useStore from '../store/useStore';

export default function BambiPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, saveAssessmentResults } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  const handleSave = (moduleName, results) => {
    saveAssessmentResults(moduleName, results);
    const state = useStore.getState();
    navigate(`/report/${patientId}/${state.activeReportId}`);
  };

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <BambiModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSave}
      />
    </div>
  );
}
