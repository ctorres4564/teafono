import React, { useEffect, useMemo, useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import AssessmentTimer from './shared/AssessmentTimer';
import AssessmentSummary from './shared/AssessmentSummary';
import { FLUENCY_SPEECH_DISFLUENCIES } from '../store/assessments/items/fluencyItems';
import {
  SEMANTIC_FLUENCY_CLASSIFICATIONS,
  SEMANTIC_FLUENCY_MODULE_VERSION,
  SEMANTIC_FLUENCY_SCORING_VERSION,
  calculateSemanticFluencySummary,
  clampTimestamp,
  createSemanticFluencyDraft,
  createSemanticFluencyResponse,
  finalizeSemanticFluencyDraft,
  getSemanticFluencyDraftKey,
  loadSemanticFluencyDraft,
  saveSemanticFluencyDraft,
} from '../store/assessments/semanticFluency';

const fieldStyle = {
  width: '100%',
  padding: '0.65rem 0.8rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-family)',
};

const SYNC_LABELS = {
  saving_local: 'salvando neste dispositivo',
  saved_local: 'salvo neste dispositivo',
  syncing: 'sincronizando',
  synced: 'sincronizado',
  failed: 'falha na sincronização',
};

export default function FluencyModule(props) {
  if (props.mode === 'speech') return <SpeechFluencyAssessment {...props} />;
  return <SemanticFluencyAssessment {...props} />;
}

function SemanticFluencyAssessment({
  patient,
  onBack,
  onSaveAssessment,
  onComplete,
  draftScope = 'guest',
}) {
  const draftKey = useMemo(() => getSemanticFluencyDraftKey({
    patientId: patient.id,
    authorId: draftScope,
  }), [draftScope, patient.id]);

  const [draft, setDraft] = useState(() => (
    loadSemanticFluencyDraft(window.localStorage, draftKey, patient.id)
    || createSemanticFluencyDraft({ patientId: patient.id, authorId: draftScope })
  ));
  const [syncStatus, setSyncStatus] = useState('saving_local');
  const [isRunning, setIsRunning] = useState(false);
  const [term, setTerm] = useState('');
  const [classification, setClassification] = useState('valid');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    setSyncStatus('saving_local');
    const timeoutId = window.setTimeout(() => {
      try {
        saveSemanticFluencyDraft(window.localStorage, draftKey, draft);
        setSyncStatus('saved_local');
      } catch {
        setSyncStatus('failed');
      }
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [draft, draftKey]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = window.setInterval(() => {
      setDraft(previous => {
        const nextElapsed = Math.min(60, (previous.context.elapsedSeconds || 0) + 1);
        if (nextElapsed >= 60) setIsRunning(false);
        return {
          ...previous,
          context: { ...previous.context, elapsedSeconds: nextElapsed },
        };
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const summary = useMemo(
    () => calculateSemanticFluencySummary(draft.responses),
    [draft.responses]
  );

  const updateContext = (field, value) => {
    setDraft(previous => ({
      ...previous,
      context: { ...previous.context, [field]: value },
    }));
  };

  const handleAddResponse = () => {
    if (!term.trim()) return;
    const response = createSemanticFluencyResponse({
      term,
      timestampSeconds: draft.context.elapsedSeconds,
      classification,
    });
    setDraft(previous => ({ ...previous, responses: [...previous.responses, response] }));
    setTerm('');
    setClassification('valid');
  };

  const updateResponse = (responseId, updates) => {
    setDraft(previous => ({
      ...previous,
      responses: previous.responses.map(response => (
        response.id === responseId ? { ...response, ...updates } : response
      )),
    }));
  };

  const removeResponse = (responseId) => {
    setDraft(previous => ({
      ...previous,
      responses: previous.responses.filter(response => response.id !== responseId),
    }));
  };

  const handleSaveDraft = () => {
    try {
      const saved = saveSemanticFluencyDraft(window.localStorage, draftKey, draft);
      setDraft(saved);
      setSyncStatus('saved_local');
    } catch {
      setSyncStatus('failed');
    }
  };

  const handleFinalize = async () => {
    const { errors, result } = finalizeSemanticFluencyDraft(draft);
    setValidationErrors(errors);
    if (!result) return;

    setIsRunning(false);
    setSyncStatus('syncing');
    const saveResult = await onSaveAssessment('fluency_verbal', result, draft.id);

    if (!saveResult?.success || saveResult?.cloudSynced === false) {
      setSyncStatus('failed');
      return;
    }

    window.localStorage.removeItem(draftKey);
    setSyncStatus(saveResult.cloudSynced ? 'synced' : 'saved_local');
    onComplete?.();
  };

  const elapsed = draft.context.elapsedSeconds || 0;
  const timeLeft = Math.max(0, 60 - elapsed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Fluência Semântica — Evocação Lexical"
        patientName={patient.name}
        onBack={onBack}
      />

      <div className="glass-panel" style={{ padding: '1rem', borderColor: '#10b981' }}>
        <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Instrumento autoral em teste de campo</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          Registro descritivo. Não produz diagnóstico, classificação normativa ou indicação de desempenho esperado para idade e escolaridade.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Contexto da aplicação</h4>
        <label className="form-group" style={{ margin: 0 }}>
          <span>Categoria definida pela profissional *</span>
          <input
            aria-label="Categoria definida pela profissional"
            value={draft.context.category}
            onChange={event => updateContext('category', event.target.value)}
            placeholder="Registre a categoria efetivamente aplicada"
            style={fieldStyle}
          />
        </label>
        <label className="form-group" style={{ margin: 0 }}>
          <span>Instrução utilizada *</span>
          <textarea
            aria-label="Instrução utilizada"
            value={draft.context.instruction}
            onChange={event => updateContext('instruction', event.target.value)}
            placeholder="Transcreva a instrução apresentada ao paciente"
            rows={2}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </label>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Módulo {SEMANTIC_FLUENCY_MODULE_VERSION} · Cálculo {SEMANTIC_FLUENCY_SCORING_VERSION}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CRONÔMETRO DA APLICAÇÃO</span>
        <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', color: isRunning ? 'var(--secondary-color)' : 'var(--text-primary)' }}>
          00:{String(timeLeft).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setIsRunning(running => !running)} disabled={timeLeft === 0} style={{ flex: 2 }}>
            {isRunning ? 'Pausar' : elapsed > 0 ? 'Retomar' : 'Iniciar'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsRunning(false);
              updateContext('elapsedSeconds', 0);
            }}
          >
            Reiniciar tempo
          </button>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Decorrido: {elapsed}s</span>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Registrar produção</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 2fr) minmax(160px, 1fr) auto', gap: '0.75rem', alignItems: 'end' }}>
          <label className="form-group" style={{ margin: 0 }}>
            <span>Produção literal</span>
            <input
              aria-label="Produção literal"
              value={term}
              onChange={event => setTerm(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') handleAddResponse();
              }}
              placeholder="Digite exatamente como foi produzido"
              style={fieldStyle}
            />
          </label>
          <label className="form-group" style={{ margin: 0 }}>
            <span>Classificação</span>
            <select aria-label="Classificação da nova produção" value={classification} onChange={event => setClassification(event.target.value)} style={fieldStyle}>
              {SEMANTIC_FLUENCY_CLASSIFICATIONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" onClick={handleAddResponse} disabled={!term.trim()} style={{ height: '42px' }}>
            Registrar em {elapsed}s
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Produções registradas ({draft.responses.length})</h4>
        {draft.responses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma produção registrada. Uma aplicação sem respostas pode ser finalizada e permanecerá descrita como zero.</p>
        ) : draft.responses.map((response, index) => (
          <div key={response.id} style={{ display: 'grid', gridTemplateColumns: '32px minmax(120px, 2fr) 88px minmax(150px, 1fr) auto', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{index + 1}.</span>
            <input
              aria-label={`Produção ${index + 1}`}
              value={response.term}
              onChange={event => updateResponse(response.id, { term: event.target.value })}
              style={fieldStyle}
            />
            <input
              aria-label={`Tempo da produção ${index + 1}`}
              type="number"
              min="0"
              max="60"
              step="0.1"
              value={response.timestampSeconds}
              onChange={event => updateResponse(response.id, { timestampSeconds: clampTimestamp(event.target.value) })}
              style={fieldStyle}
            />
            <select
              aria-label={`Classificação da produção ${index + 1}`}
              value={response.classification}
              onChange={event => updateResponse(response.id, { classification: event.target.value })}
              style={fieldStyle}
            >
              {SEMANTIC_FLUENCY_CLASSIFICATIONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <button className="btn btn-danger" onClick={() => removeResponse(response.id)} aria-label={`Excluir produção ${index + 1}`}>
              Excluir
            </button>
            {response.classification === 'manual_decision' && (
              <input
                aria-label={`Justificativa da produção ${index + 1}`}
                value={response.decisionNote}
                onChange={event => updateResponse(response.id, { decisionNote: event.target.value })}
                placeholder="Documente a decisão manual"
                style={{ ...fieldStyle, gridColumn: '2 / -1' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Observações profissionais</h4>
        <textarea
          aria-label="Observações profissionais"
          value={draft.clinicalNotes}
          onChange={event => setDraft(previous => ({ ...previous, clinicalNotes: event.target.value }))}
          placeholder="Registre observações separadas dos dados objetivos"
          rows={3}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </div>

      <AssessmentSummary
        items={[
          { label: 'Produções registradas', value: String(summary.recordedResponses) },
          { label: 'Respostas válidas', value: String(summary.validResponses), highlight: true },
          { label: 'Repetições', value: String(summary.byClassification.repetition) },
          { label: 'Denominador descritivo', value: String(summary.denominator) },
        ]}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
          {summary.intervals.map(interval => (
            <div key={interval.startSeconds} className="glass-panel" style={{ padding: '0.6rem', fontSize: '0.75rem', textAlign: 'center' }}>
              <strong>{interval.startSeconds}–{interval.endSeconds}s</strong><br />
              {interval.valid} válidas / {interval.recorded} registros
            </div>
          ))}
        </div>
        {validationErrors.length > 0 && (
          <div role="alert" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            {validationErrors.map(error => <div key={error}>• {error}</div>)}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleSaveDraft}>Salvar rascunho</button>
          <button className="btn btn-primary" onClick={handleFinalize}>Finalizar registro descritivo</button>
          <span role="status" style={{ color: syncStatus === 'failed' ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {SYNC_LABELS[syncStatus]}
          </span>
        </div>
      </AssessmentSummary>
    </div>
  );
}

function SpeechFluencyAssessment({ patient, onBack, onSaveAssessment, onComplete }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [counts, setCounts] = useState(() => Object.fromEntries(
    FLUENCY_SPEECH_DISFLUENCIES.map(item => [item.id, 0])
  ));
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const durationMin = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
    const totalDisfluencies = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const result = await onSaveAssessment('fluency_speech', {
      mode: 'speech',
      durationMin: Number(durationMin.toFixed(2)),
      counts,
      notes,
      summary: {
        totalDisfluencies,
        ratePerMinute: durationMin > 0 ? Number((totalDisfluencies / durationMin).toFixed(1)) : 0,
      },
    });
    if (result?.success) onComplete?.();
  };

  const totalCount = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader title="Avaliação de Fluência da Fala" patientName={patient.name} onBack={onBack} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Durante a amostra de fala, registre as descontinuidades observadas. Este fluxo permanece sem alteração neste incremento.
      </p>
      <AssessmentTimer
        initialSeconds={300}
        onTick={secondsLeft => setElapsedSeconds(300 - secondsLeft)}
        onTimeUp={() => window.alert('Tempo de observação concluído!')}
      />
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Registro de Descontinuidades</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {FLUENCY_SPEECH_DISFLUENCIES.map(item => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', flex: 1, color: 'var(--text-secondary)' }}>{item.label}</span>
              <input
                aria-label={item.label}
                type="number"
                min="0"
                value={counts[item.id]}
                onChange={event => setCounts(previous => ({
                  ...previous,
                  [item.id]: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                }))}
                style={{ ...fieldStyle, width: '64px', textAlign: 'center' }}
              />
            </label>
          ))}
        </div>
      </div>
      <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Observações profissionais" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
      <AssessmentSummary items={[
        { label: 'Total de Descontinuidades', value: String(totalCount) },
        { label: 'Tempo Decorrido', value: `${Math.floor(elapsedSeconds / 60)}min ${elapsedSeconds % 60}s` },
      ]}>
        <button className="btn btn-primary" onClick={handleSave}>Finalizar e salvar Fluência da Fala</button>
      </AssessmentSummary>
    </div>
  );
}
