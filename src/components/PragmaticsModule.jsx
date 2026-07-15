import React, { useState } from 'react';
import { calculatePragmatics } from '../utils/teaEvaluations';
import { interpretPragmatics, pragmaticNorms } from '../utils/developmentalNorms';
import AssessmentHeader from './shared/AssessmentHeader';
import AssessmentTimer from './shared/AssessmentTimer';
import CounterButton from './shared/CounterButton';
import ProgressBar from './shared/ProgressBar';
import AssessmentSummary from './shared/AssessmentSummary';
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

export default function PragmaticsModule({ patient, onBack, onSaveAssessment }) {
  const [verbal, setVerbal] = useState(0);
  const [vocal, setVocal] = useState(0);
  const [gestual, setGestual] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [functions, setFunctions] = useState({
    pedido: 0,
    protesto: 0,
    comentario: 0,
    resposta: 0,
    narrativa: 0
  });

  const handleIncrementMean = (type) => {
    if (type === 'verbal') setVerbal(prev => prev + 1);
    if (type === 'vocal') setVocal(prev => prev + 1);
    if (type === 'gestual') setGestual(prev => prev + 1);
  };

  const handleIncrementFunction = (field) => {
    setFunctions(prev => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const handleSave = () => {
    const durationMin = elapsedSeconds > 0 ? elapsedSeconds / 60 : 5;
    const results = calculatePragmatics({ verbal, vocal, gestual }, Number(durationMin.toFixed(2)));
    results.functions = functions;
    onSaveAssessment('pragmatics', results);
  };

  const totalActs = verbal + vocal + gestual;
  const currentRate = totalActs > 0 && elapsedSeconds > 0
    ? (totalActs / (elapsedSeconds / 60)).toFixed(1)
    : 0;

  // Get age in months from patient for norm comparison
  const getAgeInMonths = () => {
    if (!patient.birthDate) return null;
    const birth = new Date(patient.birthDate);
    const today = new Date();
    return Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30.44));
  };

  const ageMonths = getAgeInMonths();
  const ageGroup = ageMonths ? Object.keys(pragmaticNorms).find(key => {
    const [min, max] = key.split('-').map(Number);
    return ageMonths >= min && ageMonths <= max;
  }) : null;

  const developmentalComparison = ageGroup && currentRate > 0
    ? interpretPragmatics(parseFloat(currentRate), ageMonths)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Perfil Funcional de Pragmática (Fernandes)"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Durante a interação livre ou brinquedo semiestruturado com a criança, inicie o cronômetro. Clique nos botões de <strong>Meios Comunicativos</strong> correspondentes sempre que o paciente realizar um ato de comunicação direcionado ao terapeuta.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Registrar Meio de Comunicação</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <CounterButton count={verbal} label="Meio Verbal (Palavras)" onClick={() => handleIncrementMean('verbal')} color="#10b981" />
              <CounterButton count={vocal} label="Meio Vocal (Sons)" onClick={() => handleIncrementMean('vocal')} color="#f59e0b" />
              <CounterButton count={gestual} label="Meio Gestual (Gestos)" onClick={() => handleIncrementMean('gestual')} color="#3b82f6" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Mapear Funções Comunicativas (Opcional)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {[
                { key: 'pedido', label: 'Pedido', variant: 'success' },
                { key: 'protesto', label: 'Protesto', variant: 'danger' },
                { key: 'comentario', label: 'Comentário', variant: 'warning' },
                { key: 'resposta', label: 'Resposta', variant: 'success' },
                { key: 'narrativa', label: 'Narrativa', variant: 'primary' },
              ].map(fn => (
                <button
                  key={fn.key}
                  className="btn btn-secondary"
                  onClick={() => handleIncrementFunction(fn.key)}
                  style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}
                >
                  <span>{fn.label}</span>
                  <span className={`badge badge-${fn.variant}`}>{functions[fn.key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AssessmentTimer
            initialSeconds={300}
            onTick={(sec) => setElapsedSeconds(300 - sec)}
            onTimeUp={() => alert("Tempo de observação de 5 minutos concluído!")}
          />

          <AssessmentSummary
            items={[
              { label: 'Total de Atos Comunicativos', value: `${totalActs} atos`, highlight: false },
              { label: 'Tempo Decorrido', value: `${Math.floor(elapsedSeconds / 60)}min ${elapsedSeconds % 60}s` },
              { label: 'Frequência Comunicativa', value: `${currentRate} atos/min`, highlight: true },
            ]}
          >
            {totalActs > 0 && (
              <ProgressBar
                items={[
                  { label: 'Verbal', value: verbal, color: 'var(--success-color)' },
                  { label: 'Vocal', value: vocal, color: 'var(--warning-color)' },
                  { label: 'Gestual', value: gestual, color: 'var(--primary-color)' },
                ]}
              />
            )}

            {/* Developmental Comparison */}
            {developmentalComparison && ageGroup && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: developmentalComparison.severity === 0 ? 'rgba(16, 185, 129, 0.1)' : developmentalComparison.severity === 1 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${developmentalComparison.severity === 0 ? 'rgb(16, 185, 129)' : developmentalComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {developmentalComparison.severity === 0 && <CheckCircle size={16} style={{ color: 'rgb(16, 185, 129)' }} />}
                  {developmentalComparison.severity === 1 && <AlertCircle size={16} style={{ color: 'rgb(251, 191, 36)' }} />}
                  {developmentalComparison.severity >= 2 && <TrendingDown size={16} style={{ color: 'rgb(239, 68, 68)' }} />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: developmentalComparison.severity === 0 ? 'rgb(16, 185, 129)' : developmentalComparison.severity === 1 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)' }}>
                    {developmentalComparison.classification}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Esperado para {ageGroup} meses:</strong> {pragmaticNorms[ageGroup].atos_min.min}-{pragmaticNorms[ageGroup].atos_min.max} atos/min
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem', height: '44px' }}>
              Finalizar e Salvar Pragmática
            </button>
          </AssessmentSummary>
        </div>
      </div>
    </div>
  );
}
