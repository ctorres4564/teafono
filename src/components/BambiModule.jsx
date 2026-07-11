import React, { useState } from 'react';
import { calculateBambiScore } from '../utils/teaEvaluations';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function BambiModule({ patient, onBack, onSaveAssessment }) {
  const bambiQuestions = [
    { id: 1, text: "A criança se recusa a comer novos alimentos (neofobia alimentar)?" },
    { id: 2, text: "A criança se recusa a comer os mesmos alimentos que o restante da família consome?" },
    { id: 3, text: "A criança demonstra preferência extrema por uma textura de alimento (ex: come apenas crocantes ou apenas pastosos)?" },
    { id: 4, text: "A criança se recusa a comer se o alimento tocar outro alimento no prato?" },
    { id: 5, text: "A criança exige marcas específicas de alimentos ou que estejam em embalagens originais?" },
    { id: 6, text: "A criança apresenta comportamentos disruptivos durante as refeições (gritar, chorar, tentar fugir da mesa, cuspir a comida)?" },
    { id: 7, text: "A criança engasga, tem náusea (gag reflex) ou vomita com facilidade diante de certos cheiros ou texturas?" },
    { id: 8, text: "A criança armazena comida na boca sem mastigar/deglutir por longos períodos (bolsamento)?" },
    { id: 9, text: "A criança prefere apenas alimentos com cores específicas (ex: come apenas alimentos brancos ou amarelos)?" },
    { id: 10, text: "A criança come uma variedade muito reduzida de alimentos (menos de 15 a 20 alimentos no total)?" },
    { id: 11, text: "A criança é agressiva durante as refeições (ex: bate, morde ou joga comida/utensílios)?" },
    { id: 12, text: "A criança rejeita alimentos que requerem muita mastigação (ex: carnes ou vegetais fibrosos)?" },
    { id: 13, text: "A criança aceita comer apenas se estiver distraída por telas (TV, tablet ou celular)?" },
    { id: 14, text: "A criança come muito rápido ou coloca muita comida na boca de uma só vez?" },
    { id: 15, text: "A criança apresenta interesse ou comportamento obsessivo por utensílios específicos durante a refeição?" },
    { id: 16, text: "A criança aceita comer em ambientes diferentes de casa (ex: restaurantes, escola ou casa de parentes)?" },
    { id: 17, text: "A criança fica ansiosa ou irritada ao ver alimentos que não gosta dispostos na mesa?" },
    { id: 18, text: "A criança apresenta reações de defesa sensorial ao toque de certos alimentos com as mãos (aversão táctil)?" }
  ];

  // Armazena as respostas locais do BAMBI de 1 a 5 (inicialmente 3 - Às vezes)
  const [responses, setResponses] = useState(() => {
    const initial = {};
    bambiQuestions.forEach(q => {
      initial[`bambiQ${q.id}`] = 3;
    });
    return initial;
  });

  const handleScoreChange = (qId, val) => {
    setResponses(prev => ({
      ...prev,
      [`bambiQ${qId}`]: val
    }));
  };

  const handleSave = () => {
    const results = calculateBambiScore(responses);
    onSaveAssessment('bambi', results);
  };

  const currentTotal = Object.keys(responses)
    .filter(k => k.startsWith('bambiQ'))
    .reduce((acc, k) => acc + responses[k], 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Seletividade Alimentar e Sensorial (BAMBI)</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente: <strong>{patient.name}</strong></span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        O inventário clínico de comportamento alimentar avalia recusas alimentares ligadas a processamento sensorial e rigidez comportamental no TEA. Avalie de <strong>1 (Nunca)</strong> a <strong>5 (Sempre)</strong>.
      </p>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {bambiQuestions.map(q => (
          <div key={q.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--secondary-color)' }}>{q.id}.</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{q.text}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { val: 1, label: '1 - Nunca' },
                { val: 2, label: '2 - Raramente' },
                { val: 3, label: '3 - Às vezes' },
                { val: 4, label: '4 - Frequentemente' },
                { val: 5, label: '5 - Sempre' }
              ].map(opt => (
                <button
                  key={opt.val}
                  className={`score-btn ${responses[`bambiQ${q.id}`] === opt.val ? 'active-1' : ''}`}
                  onClick={() => handleScoreChange(q.id, opt.val)}
                  style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Escore Atual Acumulado: <strong>{currentTotal} / 90 pontos</strong>
        </span>
        <button className="btn btn-primary" onClick={handleSave} style={{ width: '220px', height: '48px' }}>
          <CheckCircle size={18} /> Salvar Avaliação BAMBI
        </button>
      </div>
    </div>
  );
}
