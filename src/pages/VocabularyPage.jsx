import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VocabularyModule from '../components/VocabularyModule';
import SaveStatusToast from '../components/shared/SaveStatusToast';
import useSaveAssessment from '../hooks/useSaveAssessment';
import useStore from '../store/useStore';

export default function VocabularyPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = useStore();
  const patient = patients.find((p) => p.id === patientId);
  const { saveStatus, handleSave } = useSaveAssessment({
    patientId,
    onSaved: () => navigate('/dashboard'),
  });

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <SaveStatusToast status={saveStatus} />
      <VocabularyModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSave}
        isSaving={saveStatus === 'saving'}
      />
    </div>
  );
}
