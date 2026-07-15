import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import {
  AWARENESS_SUBTESTS,
  RESPONSE_TYPES,
  RHYME_TASKS,
  SYLLABLE_WORDS,
  PHONEME_TASKS,
  BLENDING_TASKS,
  DELETION_TASKS,
  calculatePhonologicalAwarenessScore,
  getPhonologicalAwarenessRecommendations,
} from '../store/assessments/items/phonologicalAwarenessItems';
import { CheckCircle, AlertCircle } from 'lucide-react';

const SUBTEST_TASKS = {
  rhyme: RHYME_TASKS,
  syllable_count: Object.values(SYLLABLE_WORDS).flat(),
  syllable_segmentation: Object.values(SYLLABLE_WORDS).flat(),
  phoneme_identification: PHONEME_TASKS,
  phoneme_blending: BLENDING_TASKS,
  phoneme_deletion: DELETION_TASKS
};

export default function PhonologicalAwarenessModule({ patient, onBack, onSaveAssessment }) {
  const [selectedSubtest, setSelectedSubtest] = useState(AWARENESS_SUBTESTS[0].id);
  const [responses, setResponses] = useState({});
  const [observations, setObservations] = useState('');

  const currentSubtest = AWARENESS_SUBTESTS.find(s => s.id === selectedSubtest);
  const currentTasks = SUBTEST_TASKS[selectedSubtest] || [];

  const handleResponseChange = (taskIdx, responseId) => {
    setResponses(prev => ({
      ...prev,
      [selectedSubtest]: {
        ...prev[selectedSubtest],
        [taskIdx]: responseId
      }
    }));
  };

  const handleSave = () => {
    const results = {
      subtest: selectedSubtest,
      responses,
      observations,
      summary: calculatePhonologicalAwarenessScore(responses),
      recommendations: getPhonologicalAwarenessRecommendations(
        calculatePhonologicalAwarenessScore(responses).subtestScores
      )
    };
    onSaveAssessment('phonological_awareness', results);
  };

  const subtestResponses = responses[selectedSubtest] || {};
  const completedTasks = Object.values(subtestResponses).filter(v => v).length;
  const totalTasks = currentTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Avaliação de Consciência Fonológica"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Avalie a consciência fonológica do paciente em diferentes níveis. Registre se a resposta foi correta, autocorrigida ou incorreta.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {AWARENESS_SUBTESTS.map(subtest => (
          <button
            key={subtest.id}
            className={`btn ${selectedSubtest === subtest.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSubtest(subtest.id)}
            style={{ fontSize: '0.8rem' }}
            title={subtest.description}
          >
            {subtest.icon} {subtest.name}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {currentSubtest?.name}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {completedTasks}/{totalTasks} completo
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {currentTasks.map((task, idx) => {
            const taskKey = typeof task === 'string' ? task : JSON.stringify(task);
            const taskDisplay = typeof task === 'string'
              ? task
              : task.word || task.stimulus || task.phonemes || '';

            return (
              <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Tarefa {idx + 1}: <span style={{ color: 'var(--primary-color)' }}>{taskDisplay}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {RESPONSE_TYPES.map(rt => (
                    <button
                      key={rt.id}
                      onClick={() => handleResponseChange(idx, rt.id)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: `2px solid ${subtestResponses[idx] === rt.id ? rt.color : 'rgba(255,255,255,0.1)'}`,
                        background: subtestResponses[idx] === rt.id ? `${rt.color}15` : 'rgba(255,255,255,0.02)',
                        color: subtestResponses[idx] === rt.id ? rt.color : 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontWeight: subtestResponses[idx] === rt.id ? 600 : 400,
                        fontSize: '0.8rem'
                      }}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Observações Clínicas</h4>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="Registre observações sobre estratégias utilizadas, dificuldades específicas e aspectos qualitativos..."
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ height: '44px' }}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSave} style={{ height: '44px' }}>
          Finalizar e Salvar Consciência Fonológica
        </button>
      </div>
    </div>
  );
}
