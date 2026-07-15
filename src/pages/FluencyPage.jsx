import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FluencyModule from '../components/FluencyModule';
import useStore from '../store/useStore';

export default function FluencyPage() {
  const { patientId, mode } = useParams();
  const navigate = useNavigate();
  const { patients, saveAssessmentResults, currentUser, therapistSettings } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  const handleSave = async (moduleName, results, entryId) => {
    return saveAssessmentResults(moduleName, results, entryId, patientId);
  };

  return (
    <div className="glass-panel card" style={{ padding: '2rem' }}>
      <FluencyModule
        patient={patient}
        mode={mode || 'verbal'}
        draftScope={currentUser?.uid || 'guest'}
        professional={{
          name: therapistSettings?.name || '',
          registration: therapistSettings?.crfa || '',
        }}
        onBack={() => navigate('/dashboard')}
        onSaveAssessment={handleSave}
        onComplete={() => navigate('/dashboard')}
      />
    </div>
  );
}
