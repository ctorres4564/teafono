import React, { useState } from 'react';
import AssessmentHeader from './shared/AssessmentHeader';
import {
  OROFACIAL_STRUCTURES,
  AMIOFE_RATINGS,
  LIPS_ASSESSMENT,
  TONGUE_ASSESSMENT,
  JAW_ASSESSMENT,
  BREATHING_ASSESSMENT,
  calculateOrofacialScore,
  getOrofacialRecommendations,
} from '../store/assessments/items/orofacialMotorItems';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ASSESSMENTS = {
  lips: LIPS_ASSESSMENT,
  tongue: TONGUE_ASSESSMENT,
  jaw: JAW_ASSESSMENT,
  breathing: BREATHING_ASSESSMENT
};

export default function OrofacialMotorModule({ patient, onBack, onSaveAssessment }) {
  const [selectedStructure, setSelectedStructure] = useState(OROFACIAL_STRUCTURES[0].id);
  const [responses, setResponses] = useState({});
  const [observations, setObservations] = useState('');

  const currentStructure = OROFACIAL_STRUCTURES.find(s => s.id === selectedStructure);
  const currentAssessment = ASSESSMENTS[selectedStructure] || {};

  const handleRatingChange = (assessmentKey, ratingId) => {
    setResponses(prev => ({
      ...prev,
      [selectedStructure]: {
        ...prev[selectedStructure],
        [assessmentKey]: ratingId
      }
    }));
  };

  const handleSave = () => {
    const results = {
      structure: selectedStructure,
      responses,
      observations,
      summary: calculateOrofacialScore(responses),
      recommendations: getOrofacialRecommendations(responses)
    };
    onSaveAssessment('orofacial_motor', results);
  };

  const structureResponses = responses[selectedStructure] || {};
  const completedItems = Object.values(structureResponses).filter(v => v).length;
  const totalItems = Object.keys(currentAssessment).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Avaliação Miofuncional Orofacial (AMIOFE)"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Avalie cada estrutura orofacial e classifique as características observadas. Utilize escala de 0 (Normal) a 3 (Alteração Grave).
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {OROFACIAL_STRUCTURES.slice(0, 4).map(struct => (
          <button
            key={struct.id}
            className={`btn ${selectedStructure === struct.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStructure(struct.id)}
          >
            {struct.name}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {currentStructure?.name}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {completedItems}/{totalItems} completo
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

        {/* Assessment Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(currentAssessment).map(([key, assessment]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {assessment.label}
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {assessment.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRatingChange(key, AMIOFE_RATINGS[idx].id)}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      borderRadius: '8px',
                      border: `2px solid ${structureResponses[key] === AMIOFE_RATINGS[idx].id ? AMIOFE_RATINGS[idx].color : 'rgba(255,255,255,0.1)'}`,
                      background: structureResponses[key] === AMIOFE_RATINGS[idx].id ? `${AMIOFE_RATINGS[idx].color}15` : 'rgba(255,255,255,0.02)',
                      color: structureResponses[key] === AMIOFE_RATINGS[idx].id ? AMIOFE_RATINGS[idx].color : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: structureResponses[key] === AMIOFE_RATINGS[idx].id ? 600 : 400,
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: AMIOFE_RATINGS[idx].color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {idx}
                      </span>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Observações Clínicas</h4>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="Registre observações qualitativas sobre postura, tônus, simetria e outros achados relevantes..."
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-family)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ height: '44px' }}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSave} style={{ height: '44px' }}>
          Finalizar e Salvar AMIOFE
        </button>
      </div>
    </div>
  );
}
