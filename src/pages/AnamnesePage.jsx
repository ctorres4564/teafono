import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnamneseModule from '../components/AnamneseModule';
import SaveStatusToast from '../components/shared/SaveStatusToast';
import useSaveAssessment from '../hooks/useSaveAssessment';
import useStore from '../store/useStore';

export default function AnamnesePage() {
  const { patientId, entryId } = useParams();
  const navigate = useNavigate();
  const patient = useStore((s) => s.patients.find((p) => p.id === patientId));
  const { saveStatus, handleSave } = useSaveAssessment({
    patientId,
    entryId,
    onSaved: () => navigate('/dashboard'),
  });

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  let initialData = null;
  if (entryId) {
    const historyEntry = patient.history?.find((h) => h.id === entryId);
    if (historyEntry?.results?.anamnese) {
      initialData = historyEntry.results.anamnese;
    }
  }

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <SaveStatusToast status={saveStatus} />
      <AnamneseModule
        patient={patient}
        initialData={initialData}
        entryId={entryId || null}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSave}
      />
    </div>
  );
}
