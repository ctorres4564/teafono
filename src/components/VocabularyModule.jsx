import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import { calculateTTR, interpretTTR } from '../utils/developmentalNorms';
import {
  VOCABULARY_CATEGORIES,
  VOCABULARY_MODALITIES,
  VOCABULARY_RESPONSE_TYPES,
} from '../store/assessments/items/vocabularyItems';
import { TrendingUp } from 'lucide-react';

export default function VocabularyModule({ patient, onBack, onSaveAssessment }) {
  const [selectedModality, setSelectedModality] = useState(VOCABULARY_MODALITIES[0].id);
  const [selectedCategory, setSelectedCategory] = useState(VOCABULARY_CATEGORIES[0].id);
  const [responses, setResponses] = useState({});
  const [observations, setObservations] = useState('');

  const currentCategory = VOCABULARY_CATEGORIES.find(c => c.id === selectedCategory);
  const currentWords = currentCategory ? currentCategory.words : [];

  const handleResponseChange = (word, responseType) => {
    setResponses(prev => ({
      ...prev,
      [word]: { ...prev[word], [selectedModality]: responseType },
    }));
  };

  const handleSave = () => {
    const results = {
      modality: selectedModality,
      category: selectedCategory,
      responses,
      observations,
      summary: generateSummary(),
    };
    onSaveAssessment('vocabulary', results);
  };

  const generateSummary = () => {
    const modalityResponses = Object.values(responses).map(r => r[selectedModality]).filter(Boolean);
    const total = modalityResponses.length;
    const correct = modalityResponses.filter(r => r === 'correct').length;
    const substitutions = modalityResponses.filter(r =>
      r === 'semantic_substitution' || r === 'phonological_substitution'
    ).length;
    const noResponse = modalityResponses.filter(r => r === 'no_response').length;

    // Calculate TTR: unique correct responses / total responses
    const uniqueCorrect = new Set(
      Object.entries(responses)
        .filter(([_, r]) => r[selectedModality] === 'correct')
        .map(([word, _]) => word)
    ).size;

    const ttr = total > 0 ? calculateTTR(total, uniqueCorrect) : 0;
    const ttrInterpretation = interpretTTR(parseFloat(ttr));

    return { total, correct, substitutions, noResponse, ttr, ttrInterpretation, uniqueCorrect };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Avaliação de Vocabulário"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Selecione a modalidade e a categoria. Registre o tipo de resposta para cada palavra-alvo.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {VOCABULARY_MODALITIES.map(mod => (
          <button
            key={mod.id}
            className={`btn ${selectedModality === mod.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedModality(mod.id)}
          >
            {mod.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {VOCABULARY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
        {currentWords.map(word => (
          <div key={word} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <img src={`https://placehold.co/150x150?text=${encodeURIComponent(word)}`} alt={word} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--border-color)' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{word}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {VOCABULARY_RESPONSE_TYPES.map(rt => (
                <button
                  key={rt.id}
                  className={`score-btn ${responses[word]?.[selectedModality] === rt.id ? 'active-0' : ''}`}
                  onClick={() => handleResponseChange(word, rt.id)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.7rem',
                    borderColor: rt.color,
                    color: responses[word]?.[selectedModality] === rt.id ? rt.color : undefined,
                    background: responses[word]?.[selectedModality] === rt.id ? `${rt.color}20` : undefined,
                  }}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Observações Clínicas</h4>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="Registre observações qualitativas sobre o desempenho do paciente..."
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
        />
      </div>

      {(() => {
        const summary = generateSummary();
        return summary.total > 0 && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Análise de Diversidade Lexical (TTR)</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Taxa de Diversidade Lexical</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {summary.ttr}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Palavras Únicas / Total</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {summary.uniqueCorrect} de {summary.total}
                </div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', borderLeft: '3px solid rgb(59, 130, 246)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {summary.ttrInterpretation}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {(() => {
            const summary = generateSummary();
            if (summary.total === 0) return 'Nenhuma resposta registrada ainda.';
            return `Registradas: ${summary.total} | Corretas: ${summary.correct} | Substituições: ${summary.substitutions} | Sem resposta: ${summary.noResponse}`;
          })()}
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ height: '44px' }}>
          Finalizar e Salvar Vocabulário
        </button>
      </div>
    </div>
  );
}
