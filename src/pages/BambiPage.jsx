import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BambiModule from '../components/BambiModule';
import SaveStatusToast from '../components/shared/SaveStatusToast';
import useSaveAssessment from '../hooks/useSaveAssessment';
import useStore from '../store/useStore';

export default function BambiPage() {
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
      navigate(`/report/${patientId}/${result.entryId}`);
    }
  };

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <SaveStatusToast status={saveStatus} />
      <BambiModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSaveAssessment}
        isSaving={saveStatus === 'saving'}
      />
    </div>
  );
}
