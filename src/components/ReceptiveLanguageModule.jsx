import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import { calculateReceptiveScore } from '../store/assessments/items/receptiveLanguageItems';
import {
  RECEPTIVE_CATEGORIES,
  RECEPTIVE_RESPONSE_TYPES,
  getReceptiveItemsByCategory,
} from '../store/assessments/items/receptiveLanguageItems';
import { volumaryNorms } from '../utils/developmentalNorms';
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

export default function ReceptiveLanguageModule({ patient, onBack, onSaveAssessment }) {
  const [selectedCategory, setSelectedCategory] = useState(RECEPTIVE_CATEGORIES[0].id);
  const [responses, setResponses] = useState({});
  const [observations, setObservations] = useState('');

  const currentCategory = RECEPTIVE_CATEGORIES.find(c => c.id === selectedCategory);
  const currentItems = getReceptiveItemsByCategory(selectedCategory);

  const handleResponseChange = (item, responseType) => {
    setResponses(prev => ({
      ...prev,
      [item]: { ...prev[item], [selectedCategory]: responseType },
    }));
  };

  const handleSave = () => {
    const results = {
      category: selectedCategory,
      responses,
      observations,
      summary: Object.keys(RECEPTIVE_CATEGORIES).reduce((acc, catId) => {
        const category = RECEPTIVE_CATEGORIES.find(c => c.id === catId);
        acc[catId] = calculateReceptiveScore(responses, catId);
        return acc;
      }, {}),
    };
    onSaveAssessment('receptive_language', results);
  };

  const generateSummary = () => {
    const categoryResponses = Object.entries(responses)
      .filter(([_, r]) => r[selectedCategory])
      .map(([_, r]) => r[selectedCategory]);

    const total = categoryResponses.length;
    const correct = categoryResponses.filter(r => r === 'correct').length;
    const incorrect = total - correct;

    return { total, correct, incorrect };
  };

  // Get age in months from patient for norm comparison
  const getAgeInMonths = () => {
    if (!patient.birthDate) return null;
    const birth = new Date(patient.birthDate);
    const today = new Date();
    return Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30.44));
  };

  const ageMonths = getAgeInMonths();
  const ageGroup = ageMonths ? Object.keys(volumaryNorms.receptive).find(key => {
    return key === key; // Simple age group matcher
  }) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Avaliação de Linguagem Receptiva"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Avalie a compreensão da criança apresentando estímulos visuais ou verbais. Registre se a resposta foi correta ou incorreta.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {RECEPTIVE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat.id)}
            title={cat.description}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
        {currentItems.map(item => (
          <div key={item} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {RECEPTIVE_RESPONSE_TYPES.map(rt => (
                <button
                  key={rt.id}
                  className={`score-btn ${responses[item]?.[selectedCategory] === rt.id ? 'active-0' : ''}`}
                  onClick={() => handleResponseChange(item, rt.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    borderColor: rt.color,
                    color: responses[item]?.[selectedCategory] === rt.id ? rt.color : undefined,
                    background: responses[item]?.[selectedCategory] === rt.id ? `${rt.color}20` : undefined,
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
          placeholder="Registre observações qualitativas sobre a compreensão e estratégias utilizadas..."
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
        />
      </div>

      {(() => {
        const summary = generateSummary();
        return summary.total > 0 && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Resumo da Categoria: {currentCategory?.name}</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Apresentado</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {summary.total}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Corretos</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgb(16, 185, 129)' }}>
                  {summary.correct}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Porcentagem</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ height: '44px' }}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSave} style={{ height: '44px' }}>
          Finalizar e Salvar Linguagem Receptiva
        </button>
      </div>
    </div>
  );
}
