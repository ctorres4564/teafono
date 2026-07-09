import React, { useState } from 'react';
import { calculateMchatScore } from '../utils/teaEvaluations';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function MchatModule({ patient, onBack, onSaveAssessment }) {
  const mchatQuestions = [
    { id: 1, text: "Se você apontar para alguma coisa do outro lado da sala, seu filho olha para ela? (Ex: olha para um brinquedo ou animal que você apontou)" },
    { id: 2, text: "Você já se perguntou se seu filho poderia ser surdo?" },
    { id: 3, text: "Seu filho brinca de faz-de-conta? (Ex: finge beber em um copo vazio, finge falar ao telefone, finge dar comida a um boneco)" },
    { id: 4, text: "Seu filho gosta de subir nas coisas? (Ex: subir em móveis, brinquedos do parque ou escadas)" },
    { id: 5, text: "Seu filho faz movimentos incomuns com os dedos perto dos olhos? (Ex: abana os dedos perto dos olhos)" },
    { id: 6, text: "Seu filho aponta com um dedo para pedir alguma coisa ou para conseguir ajuda? (Ex: aponta para um brinquedo ou comida que está fora do alcance)" },
    { id: 7, text: "Seu filho aponta com um dedo para mostrar algo interessante para você? (Ex: aponta para um avião no céu ou um caminhão grande na rua)" },
    { id: 8, text: "Seu filho se interessa por outras crianças? (Ex: olha para elas, sorri para elas, aproxima-se delas)" },
    { id: 9, text: "Seu filho traz coisas para mostrar para você? (Ex: traz um desenho, brinquedo ou flor para lhe mostrar)" },
    { id: 10, text: "Seu filho responde quando você chama pelo nome dele? (Ex: olha para você, fala ou faz algo quando você o chama)" },
    { id: 11, text: "Quando você sorri para o seu filho, ele sorri de volta?" },
    { id: 12, text: "Seu filho se incomoda com barulhos diários? (Ex: grita ou chora com aspirador de pó, secador de cabelo ou música alta)" },
    { id: 13, text: "Seu filho já anda de pé?" },
    { id: 14, text: "Seu filho olha nos seus olhos quando você fala com ele, brinca com ele ou o veste?" },
    { id: 15, text: "Seu filho tenta copiar o que você faz? (Ex: tchau com a mão, bater palmas, imitar barulho)" },
    { id: 16, text: "Se você virar a cabeça para olhar para alguma coisa, seu filho vira a cabeça para ver o que você está olhando?" },
    { id: 17, text: "Seu filho tenta fazer com que você olhe para ele? (Ex: olha para você para receber um elogio, diz 'olha para mim')" },
    { id: 18, text: "Seu filho entende quando você diz para ele fazer alguma coisa? (Ex: se você não apontar, ele entende 'coloque o sapato ali' ou 'traga a bola')" },
    { id: 19, text: "Se alguma coisa nova acontece, seu filho olha para a sua cara para ver como você se sente em relação àquilo? (Ex: olha para você se ouve um barulho estranho)" },
    { id: 20, text: "Seu filho gosta de atividades de movimento? (Ex: ser balançado, embalado, girado ou pulado no seu joelho)" }
  ];

  // Armazena as respostas como booleanos. Default: true (Sim) para todas
  const [responses, setResponses] = useState(() => {
    const initial = {};
    mchatQuestions.forEach(q => {
      initial[`q${q.id}`] = true;
    });
    return initial;
  });

  const handleAnswerChange = (qId, val) => {
    setResponses(prev => ({
      ...prev,
      [`q${qId}`]: val
    }));
  };

  const handleSave = () => {
    const results = calculateMchatScore(responses);
    onSaveAssessment('mchat', results);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Triagem de Sinais Precoces (M-CHAT-R/F)</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente: <strong>{patient.name}</strong></span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Responda Sim ou Não de acordo com o comportamento habitual da criança. Caso o comportamento ocorra raramente ou apenas algumas vezes, responda como "Não" (indica falha de desenvolvimento).
      </p>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {mchatQuestions.map(q => (
          <div key={q.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
              <span style={{ fontWeight: 800, color: 'var(--secondary-color)', fontSize: '0.95rem', marginTop: '0.15rem' }}>{q.id}.</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{q.text}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button 
                className={`score-btn ${responses[`q${q.id}`] === true ? 'active-0' : ''}`}
                style={{ width: '70px', padding: '0.4rem' }}
                onClick={() => handleAnswerChange(q.id, true)}
              >
                SIM
              </button>
              <button 
                className={`score-btn ${responses[`q${q.id}`] === false ? 'active-2' : ''}`}
                style={{ width: '70px', padding: '0.4rem' }}
                onClick={() => handleAnswerChange(q.id, false)}
              >
                NÃO
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-end', width: '220px', height: '48px' }}>
        <CheckCircle size={18} /> Salvar Triagem M-CHAT
      </button>
    </div>
  );
}
