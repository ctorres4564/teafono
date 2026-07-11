import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MchatModule from '../components/MchatModule';
import useStore from '../store/useStore';

export default function MchatPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, saveAssessmentResults } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  const handleSave = (moduleName, results) => {
    saveAssessmentResults(moduleName, results);
    navigate(`/followup/${patientId}`, { state: { responses: results } });
  };

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <MchatModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSave}
      />
    </div>
  );
}
