import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnamneseModule from '../components/AnamneseModule';
import useStore from '../store/useStore';

export default function AnamnesePage() {
  const { patientId, entryId } = useParams();
  const navigate = useNavigate();
  const patient = useStore((s) => s.patients.find((p) => p.id === patientId));

  console.log(`[DIAGNÓSTICO] 🎯 ANAMNESEPAGE RENDERIZADO - ENTRADA`, {
    timestamp: new Date().toISOString(),
    patientId,
    entryId,
    patientFound: !!patient,
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = useCallback(async (moduleName, results, id) => {
    try {
      setSaveStatus('saving');
      const state = useStore.getState();
      const result = await state.saveAssessmentResults(moduleName, results, id || entryId, patientId);
      if (result?.success) {
        if (result.cloudSynced === false) {
          console.warn('[AnamnesePage] Salvo localmente, mas falhou a sincronização com a nuvem.');
          setSaveStatus('saved-offline');
        } else {
          setSaveStatus('saved');
        }
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        console.error('[AnamnesePage] Falha ao salvar:', result?.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error('[AnamnesePage] Erro ao salvar:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  }, [patientId, entryId, navigate]);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  // INSPEÇÃO COMPLETA DO PATIENT OBJECT - SEMPRE EXECUTA
  console.log(`[DIAGNÓSTICO] 🔬 PATIENT OBJECT INSPECTION:`, {
    "1. patientId": patient?.id,
    "2. patientName": patient?.name,
    "3. patient.history.length": patient?.history?.length || 0,
    "4. patient.history is Array": Array.isArray(patient?.history),
    "5. patient keys": Object.keys(patient || {}),
  });

  console.log(`[DIAGNÓSTICO] 🔬 PATIENT.HISTORY COMPLETE CONTENT:`,
    patient?.history?.map((hist, idx) => ({
      "historyIndex": idx,
      "history.id": hist?.id,
      "history.date": hist?.date,
      "Object.keys(history)": Object.keys(hist || {}),
      "Object.keys(history.results)": hist?.results ? Object.keys(hist.results) : "results is null/undefined",
      "history.results.anamnese EXISTS": !!hist?.results?.anamnese,
      "history.results.anamnese VALUE": hist?.results?.anamnese,
      "checkKeyVariations": {
        "results.anamnese": hist?.results?.anamnese,
        "results['anamnese']": hist?.results?.['anamnese'],
        "results.anamnesis": hist?.results?.anamnesis,
        "results.anamneses": hist?.results?.anamneses,
      },
      "completeResults": hist?.results,
      "completeHistory": hist,
    })) || "HISTORY IS NULL OR UNDEFINED"
  );

  let initialData = null;
  if (entryId) {
    const historyEntry = patient.history?.find((h) => h.id === entryId);
    if (historyEntry?.results?.anamnese) {
      initialData = historyEntry.results.anamnese;
    }
    console.log(`[DIAGNÓSTICO] 📋 ANAMNESEPAGE - CARREGANDO DADOS:`, {
      patientId,
      entryId,
      patientFound: !!patient,
      patientName: patient?.name,
      patientHistoryLength: patient?.history?.length,
      historyEntryFound: !!historyEntry,
      historyEntryId: historyEntry?.id,
      historyEntryDate: historyEntry?.date,
      historyEntryResults: historyEntry?.results,
      anamneseFound: !!historyEntry?.results?.anamnese,
      initialDataKeys: initialData ? Object.keys(initialData) : null,
      initialData,
    });
  }

  // LOG FINAL: MOSTRAR POR QUE initialData É NULL
  console.log(`[DIAGNÓSTICO] 🔍 INITIALDATA CALCULATION:`, {
    "entryId provided": !!entryId,
    "entryId value": entryId,
    "if (entryId) WILL EXECUTE": !!entryId,
    "final initialData": initialData,
    "initialData type": typeof initialData,
    "initialData is null": initialData === null,
    "WHY initialData is null": entryId ? (
      initialData === null ? "historyEntry?.results?.anamnese was falsy" : "data found and assigned"
    ) : "entryId is falsy so if block never executed",
  });

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
      {saveStatus === 'saved-offline' && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          Dados salvos localmente. Sincronização com a nuvem falhou — tentaremos novamente mais tarde.
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
