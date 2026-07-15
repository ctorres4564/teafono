import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import AssessmentSummary from './shared/AssessmentSummary';
import { interpretPCCR, phonologyNorms } from '../utils/developmentalNorms';
import { PHONOLOGY_WORDS, PHONOLOGY_CONSONANTS, calculatePCCR } from '../store/assessments/items/phonologyItems';
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

const PRODUCTION_OPTIONS = [
  { id: 'correct', label: 'Correta', color: 'var(--success-color)' },
  { id: 'omitted', label: 'Omitida', color: 'var(--danger-color)' },
  { id: 'substituted', label: 'Substituída', color: 'var(--warning-color)' },
  { id: 'distorted', label: 'Distorcida', color: '#f97316' },
];

export default function PhonologyModule({ patient, onBack, onSaveAssessment }) {
  const [productions, setProductions] = useState(() => {
    return PHONOLOGY_WORDS.map(w => ({
      ...w,
      transcription: '',
      observations: '',
      consoants: {},
    }));
  });

  const [selectedWordIdx, setSelectedWordIdx] = useState(0);

  const current = productions[selectedWordIdx] || productions[0];

  const updateProduction = (idx, field, value) => {
    setProductions(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleConsonantChange = (consonantId, value) => {
    setProductions(prev => prev.map((p, i) => {
      if (i !== selectedWordIdx) return p;
      return { ...p, consoants: { ...p.consoants, [consonantId]: value } };
    }));
  };

  const handleSave = () => {
    const pccr = calculatePCCR(productions);
    const results = {
      productions,
      pccr,
      observations: productions.map(p => p.observations).filter(Boolean).join('\n'),
    };
    onSaveAssessment('phonology', results);
  };

  const allFilled = productions.every(p => p.transcription.trim());

  // Get age in months from patient for norm comparison
  const getAgeInMonths = () => {
    if (!patient.birthDate) return null;
    const birth = new Date(patient.birthDate);
    const today = new Date();
    return Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30.44));
  };

  const ageMonths = getAgeInMonths();
  const ageGroup = ageMonths ? Object.keys(phonologyNorms).find(key => {
    const [min, max] = key.split('-').map(Number);
    return ageMonths >= min && ageMonths <= max;
  }) : null;

  const developmentalComparison = allFilled && ageGroup
    ? interpretPCCR(calculatePCCR(productions).percentage, ageMonths)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Avaliação Fonológica"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Mostre cada figura ou diga a palavra-alvo. Registre a produção do paciente e classifique cada consoante.
      </p>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto' }}>
        {productions.map((p, idx) => (
          <button
            key={p.id}
            className={`btn ${idx === selectedWordIdx ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedWordIdx(idx)}
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              borderColor: p.transcription ? 'var(--success-color)' : undefined,
            }}
          >
            {p.target}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <img src={current.imageUrl || `https://placehold.co/150x150?text=${encodeURIComponent(current.target)}`} alt={current.target} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--border-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Palavra: {current.target}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedWordIdx + 1} de {productions.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Produção (transcrição fonética)</label>
          <input
            type="text"
            value={current.transcription}
            onChange={e => updateProduction(selectedWordIdx, 'transcription', e.target.value)}
            placeholder="Ex: /'bɔlɐ/"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Classificação das Consoantes
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
            {PHONOLOGY_CONSONANTS.map(cons => (
              <div key={cons.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontWeight: 700, width: '30px', fontSize: '0.9rem' }}>{cons.symbol}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flex: 1 }}>{cons.name}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {PRODUCTION_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleConsonantChange(cons.id, opt.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        border: `1px solid ${opt.color}`,
                        background: current.consoants[cons.id] === opt.id ? `${opt.color}25` : 'transparent',
                        color: current.consoants[cons.id] === opt.id ? opt.color : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: current.consoants[cons.id] === opt.id ? 700 : 400,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Observações</label>
          <input
            type="text"
            value={current.observations}
            onChange={e => updateProduction(selectedWordIdx, 'observations', e.target.value)}
            placeholder="Ex: produção inconsistente, omissão de consoante final..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <AssessmentSummary
        items={[
          { label: 'Palavras Registradas', value: `${productions.filter(p => p.transcription).length}/${productions.length}` },
          ...(allFilled ? [{ label: 'PCC-R', value: `${calculatePCCR(productions).percentage}%`, highlight: true }] : []),
        ]}
      >
        {allFilled && (() => {
          const pccr = calculatePCCR(productions);
          return (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem', background: 'rgba(139,92,246,0.05)', borderRadius: '8px' }}>
                <strong>Classificação:</strong> {pccr.classification} ({pccr.correct}/{pccr.total} consoantes corretas)
              </div>

              {/* Developmental Comparison */}
              {developmentalComparison && ageGroup && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: developmentalComparison.severity === 0 ? 'rgba(16, 185, 129, 0.1)' : developmentalComparison.severity === 1 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${developmentalComparison.severity === 0 ? 'rgb(16, 185, 129)' : developmentalComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {developmentalComparison.severity === 0 && <CheckCircle size={16} style={{ color: 'rgb(16, 185, 129)' }} />}
                    {developmentalComparison.severity === 1 && <AlertCircle size={16} style={{ color: 'rgb(251, 191, 36)' }} />}
                    {developmentalComparison.severity >= 2 && <TrendingDown size={16} style={{ color: 'rgb(239, 68, 68)' }} />}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: developmentalComparison.severity === 0 ? 'rgb(16, 185, 129)' : developmentalComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)' }}>
                      {developmentalComparison.classification}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Esperado para {ageGroup} meses:</strong> {phonologyNorms[ageGroup].pcc_r_range.min}-{phonologyNorms[ageGroup].pcc_r_range.max}% PCC-R
                  </div>
                </div>
              )}
            </>
          );
        })()}
        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem', height: '44px' }} disabled={!allFilled}>
          Finalizar e Salvar Fonologia
        </button>
      </AssessmentSummary>
    </div>
  );
}
