import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnamneseModule from '../components/AnamneseModule';
import useStore from '../store/useStore';

export default function AnamnesePage() {
  const { patientId, entryId } = useParams();
  const navigate = useNavigate();
  const patient = useStore((s) => s.patients.find((p) => p.id === patientId));
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = useCallback((moduleName, results, id) => {
    try {
      setSaveStatus('saving');
      const state = useStore.getState();
      state.saveAssessmentResults(moduleName, results, id || entryId, patientId);
      setSaveStatus('saved');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      console.error('[AnamnesePage] Erro ao salvar:', err);
      setSaveStatus('error');
    }
  }, [patientId, entryId, navigate]);

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
      {saveStatus === 'saved' && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          Dados salvos com sucesso!
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
        }}>
          Erro ao salvar dados. Verifique o console para detalhes.
        </div>
      )}
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
