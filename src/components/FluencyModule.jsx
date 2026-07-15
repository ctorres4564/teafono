import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import AssessmentTimer from './shared/AssessmentTimer';
import AssessmentSummary from './shared/AssessmentSummary';
import { fluencyNorms } from '../utils/developmentalNorms';
import { FLUENCY_VERBAL_CATEGORIES, FLUENCY_SPEECH_DISFLUENCIES, FLUENCY_TRANSCRIPTION_FIELDS } from '../store/assessments/items/fluencyItems';
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

export default function FluencyModule({ patient, onBack, onSaveAssessment, mode = 'verbal' }) {
  const isVerbal = mode === 'verbal';
  const [selectedCategory, setSelectedCategory] = useState(isVerbal ? FLUENCY_VERBAL_CATEGORIES[0].id : null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [counts, setCounts] = useState(() => {
    const initial = {};
    if (isVerbal) {
      FLUENCY_TRANSCRIPTION_FIELDS.forEach(f => { initial[f.id] = 0; });
    } else {
      FLUENCY_SPEECH_DISFLUENCIES.forEach(d => { initial[d.id] = 0; });
    }
    return initial;
  });
  const [notes, setNotes] = useState('');

  const handleCountChange = (id, delta) => {
    setCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const handleManualCount = (id, val) => {
    setCounts(prev => ({ ...prev, [id]: Math.max(0, parseInt(val) || 0) }));
  };

  const handleSave = () => {
    const durationMin = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
    const results = {
      mode,
      category: selectedCategory,
      durationMin: Number(durationMin.toFixed(2)),
      counts,
      transcription: isVerbal ? transcription : undefined,
      notes,
    };

    if (isVerbal) {
      const total = counts.totalWords || 0;
      const unique = counts.uniqueWords || 0;
      const rate = durationMin > 0 ? Number((total / durationMin).toFixed(1)) : 0;
      results.summary = { totalWords: total, uniqueWords: unique, ratePerMinute: rate, lexicalDiversity: total > 0 ? Number((unique / total * 100).toFixed(1)) : 0 };
    } else {
      const totalDisfluencies = Object.values(counts).reduce((a, b) => a + b, 0);
      const rate = durationMin > 0 ? Number((totalDisfluencies / durationMin).toFixed(1)) : 0;
      results.summary = { totalDisfluencies, ratePerMinute: rate };
    }

    onSaveAssessment(isVerbal ? 'fluency_verbal' : 'fluency_speech', results);
  };

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const durationMin = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
  const rate = durationMin > 0 && totalCount > 0 ? (totalCount / durationMin).toFixed(1) : 0;

  // Get age in months and determine appropriate norms
  const getAgeInMonths = () => {
    if (!patient.birthDate) return null;
    const birth = new Date(patient.birthDate);
    const today = new Date();
    return Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30.44));
  };

  const ageMonths = getAgeInMonths();
  const getAgeGroup = () => {
    if (!ageMonths) return 'adult';
    if (ageMonths < 24) return '24-36';
    if (ageMonths < 37) return '24-36';
    if (ageMonths < 49) return '37-48';
    if (ageMonths < 60) return '49-60';
    return 'adult';
  };
  const ageGroup = getAgeGroup();

  // Calculate fluency comparison for verbal mode
  const fluencyComparison = isVerbal && totalCount > 0
    ? (() => {
        const norm = fluencyNorms.speech_rate[ageGroup];
        const speechRate = parseFloat(rate);
        let severity = 0;
        let classification = 'Dentro do esperado';

        if (speechRate < norm.min) {
          severity = 2;
          classification = 'Redução de velocidade';
        } else if (speechRate >= norm.expected) {
          severity = 0;
          classification = 'Dentro do esperado';
        } else if (speechRate >= (norm.min + norm.expected) / 2) {
          severity = 1;
          classification = 'Levemente reduzida';
        }

        return { classification, severity, norm, speechRate };
      })()
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title={isVerbal ? 'Avaliação de Fluência Verbal' : 'Avaliação de Fluência da Fala'}
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {isVerbal
          ? 'Solicite que o paciente fale o maior número de palavras dentro da categoria escolhida em 1 minuto.'
          : 'Durante a amostra de fala espontânea, registre as descontinuidades observadas.'}
      </p>

      <AssessmentTimer
        initialSeconds={isVerbal ? 60 : 300}
        onTick={(sec) => setElapsedSeconds(isVerbal ? 60 - sec : 300 - sec)}
        onTimeUp={() => alert(isVerbal ? 'Tempo de 1 minuto concluído!' : 'Tempo de observação concluído!')}
      />

      {isVerbal && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FLUENCY_VERBAL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ fontSize: '0.8rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {isVerbal && (
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Transcrição</h4>
          <textarea
            value={transcription}
            onChange={e => setTranscription(e.target.value)}
            placeholder="Transcreva as palavras ditas pelo paciente..."
            rows={3}
            style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
          />
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
          {isVerbal ? 'Contadores' : 'Registro de Descontinuidades'}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {Object.keys(counts).map(key => {
            const label = isVerbal
              ? FLUENCY_TRANSCRIPTION_FIELDS.find(f => f.id === key)?.label || key
              : FLUENCY_SPEECH_DISFLUENCIES.find(d => d.id === key)?.label || key;

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', flex: 1, color: 'var(--text-secondary)' }}>{label}</span>
                <button className="btn btn-secondary btn-icon" onClick={() => handleCountChange(key, -1)} style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>-</button>
                <input
                  type="number"
                  value={counts[key]}
                  onChange={e => handleManualCount(key, e.target.value)}
                  style={{ width: '50px', textAlign: 'center', padding: '0.3rem', fontSize: '0.85rem' }}
                />
                <button className="btn btn-primary btn-icon" onClick={() => handleCountChange(key, 1)} style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>+</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Observações Clínicas</h4>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações qualitativas..."
          rows={2}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
        />
      </div>

      <AssessmentSummary
        items={[
          { label: isVerbal ? 'Total de Palavras' : 'Total de Descontinuidades', value: String(totalCount) },
          { label: 'Tempo Decorrido', value: `${Math.floor(elapsedSeconds / 60)}min ${elapsedSeconds % 60}s` },
          ...(totalCount > 0 ? [{ label: isVerbal ? 'Palavras/min' : 'Descontinuidades/min', value: `${rate}`, highlight: true }] : []),
        ]}
      >
        {/* Developmental Comparison for Verbal Fluency */}
        {fluencyComparison && (
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: fluencyComparison.severity === 0 ? 'rgba(16, 185, 129, 0.1)' : fluencyComparison.severity === 1 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${fluencyComparison.severity === 0 ? 'rgb(16, 185, 129)' : fluencyComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {fluencyComparison.severity === 0 && <CheckCircle size={16} style={{ color: 'rgb(16, 185, 129)' }} />}
              {fluencyComparison.severity === 1 && <AlertCircle size={16} style={{ color: 'rgb(251, 191, 36)' }} />}
              {fluencyComparison.severity >= 2 && <TrendingDown size={16} style={{ color: 'rgb(239, 68, 68)' }} />}
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: fluencyComparison.severity === 0 ? 'rgb(16, 185, 129)' : fluencyComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)' }}>
                {fluencyComparison.classification}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Esperado para {ageGroup} meses:</strong> {fluencyComparison.norm.min}-{fluencyComparison.norm.max} palavras/min
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem', height: '44px' }}>
          Finalizar e Salvar {isVerbal ? 'Fluência Verbal' : 'Fluência da Fala'}
        </button>
      </AssessmentSummary>
    </div>
  );
}
