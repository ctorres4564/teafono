import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MchatModule from '../components/MchatModule';
import SaveStatusToast from '../components/shared/SaveStatusToast';
import useSaveAssessment from '../hooks/useSaveAssessment';
import useStore from '../store/useStore';

export default function MchatPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = useStore();
  const patient = patients.find((p) => p.id === patientId);
  const { saveStatus, handleSave } = useSaveAssessment({ patientId });

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  const handleSaveAssessment = async (moduleName, results) => {
    const result = await handleSave(moduleName, results);
    if (result?.success) {
      navigate(`/followup/${patientId}`, { state: { responses: results } });
    }
  };

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <SaveStatusToast status={saveStatus} />
      <MchatModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSaveAssessment}
      />
    </div>
  );
}
