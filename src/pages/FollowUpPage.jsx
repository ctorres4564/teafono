import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react';
import useStore from '../store/useStore';

const followUpQuestions = [
  { id: 1, text: "Se você apontar para alguma coisa do outro lado da sala, seu filho olha para ela?", detail: "Peça ao responsável que descreva se a criança vira a cabeça e segue com os olhos a direção do apontamento." },
  { id: 2, text: "Você já se perguntou se seu filho poderia ser surdo?", detail: "Pergunte detalhadamente se a audição já foi testada (teste da orelhinha/audiometria) e se houve preocupação com perda auditiva." },
  { id: 3, text: "Seu filho brinca de faz-de-conta?", detail: "Descreva exemplos específicos de brincadeiras de fingir que a criança realiza (dar comidinha, falar ao telefone de mentirinha, cuidar de boneco)." },
  { id: 4, text: "Seu filho gosta de subir nas coisas?", detail: "Especifique comportamentos de escalada atípicos (subir em janelas, estantes, telhados) versus brincadeira funcional em playground." },
  { id: 5, text: "Seu filho faz movimentos incomuns com os dedos perto dos olhos?", detail: "Peça que a família demonstre ou descreva exatamente o movimento (abana os dedos? olha objetos de canto de olho? gira objetos próximos ao rosto?)." },
  { id: 6, text: "Seu filho aponta com um dedo para pedir alguma coisa ou para conseguir ajuda?", detail: "Diferenciar o apontar protoimperativo (pedir) do protodeclarativo (mostrar). A criança estica o braço e o dedo indicador? Olha para o adulto enquanto aponta?" },
  { id: 7, text: "Seu filho aponta com um dedo para mostrar algo interessante para você?", detail: "Qual foi a última vez que a criança apontou para compartilhar interesse (não para pedir), olhando para o adulto e para o objeto alternadamente?" },
  { id: 8, text: "Seu filho se interessa por outras crianças?", detail: "Descreva situações reais: a criança busca ativamente outras crianças? Como reage quando outras crianças se aproximam? Fica indiferente?" },
  { id: 9, text: "Seu filho traz coisas para mostrar para você?", detail: "Peça exemplos recentes de objetos que a criança trouxe para o adulto ver (atenção compartilhada espontânea, não apenas para abrir/ativar um brinquedo)." },
  { id: 10, text: "Seu filho responde quando você chama pelo nome dele?", detail: "Em quantas de 10 tentativas diárias a criança responde ao nome? Em que contexto (barulho de TV, brincando, etc.)?" },
  { id: 11, text: "Quando você sorri para o seu filho, ele sorri de volta?", detail: "Descreva o contexto: a criança retribui sorrisos espontaneamente? O sorriso é direcionado ou parece sem conexão com a interação?" },
  { id: 12, text: "Seu filho se incomoda com barulhos diários?", detail: "Liste os barulhos específicos que causam reação (aspirador, liquidificador, secador, música alta). A reação inclui tapar ouvidos, gritar, chorar, fugir?" },
  { id: 13, text: "Seu filho já anda de pé?", detail: "Confirmar se a criança adquiriu a marcha. Se sim, com que idade? A marcha é atípica (na ponta dos pés, assimétrica, desajeitada)?" },
  { id: 14, text: "Seu filho olha nos seus olhos quando você fala com ele, brinca com ele ou o veste?", detail: "Descreva a qualidade do contato visual: é fugaz (menos de 2 segundos), moderado, ou sustentado? Em que situação é pior?" },
  { id: 15, text: "Seu filho tenta copiar o que você faz?", detail: "Peça exemplos: a criança imita gestos (tchau, palmas, caretas), sons, ou ações do cotidiano? Se não imita, já houve tentativa de ensinar?" },
  { id: 16, text: "Se você virar a cabeça para olhar para alguma coisa, seu filho vira a cabeça para ver o que você está olhando?", detail: "Descreva o comportamento de seguir o olhar do adulto (joint attention): a criança percebe a mudança de direção do olhar do adulto e busca o foco de interesse?" },
  { id: 17, text: "Seu filho tenta fazer com que você olhe para ele?", detail: "Descreva situações em que a criança buscou ativamente a atenção do adulto para si (chamou, cutucou, trouxe objeto para ser olhado)." },
  { id: 18, text: "Seu filho entende quando você diz para ele fazer alguma coisa?", detail: "Verifique a compreensão verbal sem pistas gestuais: 'pegue o sapato', 'me dê a colher', 'vá até a porta'. Em quantas de 5 tentativas a criança responde adequadamente?" },
  { id: 19, text: "Se alguma coisa nova acontece, seu filho olha para a sua cara para ver como você se sente em relação àquilo?", detail: "Comportamento de referência social: a criança busca a expressão facial do adulto diante de algo novo (barulho, visita, brinquedo) para avaliar a situação?" },
  { id: 20, text: "Seu filho gosta de atividades de movimento?", detail: "Detalhe: a criança busca ativamente ser balançada, girada? Há comportamento de autoestimulação vestibular (girar o próprio corpo, balançar-se repetidamente)?" },
];

export default function FollowUpPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { patients, saveAssessmentResults } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  const initialResponses = location.state?.responses || {};
  const initialRisk = initialResponses.risk || '';

  const [responses, setResponses] = React.useState(() => {
    const initial = {};
    followUpQuestions.forEach(q => { initial[`q${q.id}`] = true; });
    return initial;
  });

  const [skipFollowUp, setSkipFollowUp] = React.useState(false);

  const handleAnswerChange = (qId, val) => {
    setResponses(prev => ({ ...prev, [`q${qId}`]: val }));
  };

  const handleSaveWithFollowUp = () => {
    let score = 0;
    const negativeFailQuestions = [1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
    const positiveFailQuestions = [2, 5, 12];

    negativeFailQuestions.forEach(qNum => {
      if (responses[`q${qNum}`] === false) score += 1;
    });
    positiveFailQuestions.forEach(qNum => {
      if (responses[`q${qNum}`] === true) score += 1;
    });

    let risk = '';
    let recommendation = '';
    if (score >= 8) {
      risk = 'Alto Risco';
      recommendation = 'Encaminhar imediatamente para avaliação diagnóstica especializada formal com equipe multidisciplinar e intervenção precoce.';
    } else if (score >= 3) {
      risk = 'Médio Risco (Mantido após Follow-Up)';
      recommendation = 'Monitoramento intensivo do desenvolvimento e reavaliação em 3-6 meses. Encaminhar para intervenção fonoaudiológica e estimulação precoce.';
    } else {
      risk = 'Baixo Risco (Após Follow-Up)';
      recommendation = 'Nenhuma ação clínica de risco para autismo necessária no momento. Continuar acompanhamento do desenvolvimento de rotina infantil. Familiares orientados sobre sinais de alerta.';
    }

    const results = { score, maxScore: 20, risk, recommendation, followUpCompleted: true };
    saveAssessmentResults('mchat', results);
    const state = useStore.getState();
    navigate(`/report/${patientId}/${state.activeReportId}`);
  };

  const handleSkipAndSaveDirect = () => {
    const results = { ...initialResponses, followUpCompleted: false };
    saveAssessmentResults('mchat', results);
    const state = useStore.getState();
    navigate(`/report/${patientId}/${state.activeReportId}`);
  };

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  if (initialRisk !== 'Médio Risco') {
    return (
      <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <CheckCircle size={48} style={{ color: 'var(--success-color)' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>M-CHAT Concluído</h3>
        <p style={{ color: 'var(--text-secondary)' }}>A Entrevista de Seguimento é recomendada apenas para casos de Médio Risco. Seu paciente foi classificado como <strong>{initialRisk}</strong>.</p>
        <button className="btn btn-primary" onClick={handleSkipAndSaveDirect} style={{ marginTop: '0.5rem' }}>Ir para o Laudo</button>
      </div>
    );
  }

  if (skipFollowUp) {
    return (
      <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <MessageSquare size={48} style={{ color: 'var(--warning-color)' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Pular Follow-Up</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Você optou por não aplicar a Entrevista de Seguimento. O score original do M-CHAT será mantido: <strong>{initialResponses.score} / 20 falhas ({initialRisk})</strong>.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recomenda-se aplicar o Follow-Up futuramente para melhor precisão diagnóstica em casos de Médio Risco.</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setSkipFollowUp(false)}>Voltar e Aplicar</button>
          <button className="btn btn-primary" onClick={handleSkipAndSaveDirect}>Confirmar Score Original</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>M-CHAT-R/F - Entrevista de Seguimento</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente: <strong>{patient.name}</strong></span>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '12px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--warning-color)' }}>Por que esta etapa?</strong> O M-CHAT-R/F original indicou <strong>Médio Risco (score: {initialResponses.score} / 20)</strong>.
          A Entrevista de Seguimento aprimora a especificidade do instrumento, reduzindo falsos positivos através de perguntas detalhadas com exemplos específicos do comportamento da criança.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {followUpQuestions.map(q => (
          <div key={q.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
              <span style={{ fontWeight: 800, color: 'var(--warning-color)', fontSize: '0.95rem', marginTop: '0.15rem' }}>{q.id}.</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: 600 }}>{q.text}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4', fontStyle: 'italic' }}>{q.detail}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignSelf: 'flex-end' }}>
              <button className={`score-btn ${responses[`q${q.id}`] === true ? 'active-0' : ''}`} style={{ width: '70px', padding: '0.4rem' }} onClick={() => handleAnswerChange(q.id, true)}>SIM</button>
              <button className={`score-btn ${responses[`q${q.id}`] === false ? 'active-2' : ''}`} style={{ width: '70px', padding: '0.4rem' }} onClick={() => handleAnswerChange(q.id, false)}>NÃO</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={() => setSkipFollowUp(true)} style={{ width: '180px' }}>Pular Follow-Up</button>
        <button className="btn btn-primary" onClick={handleSaveWithFollowUp} style={{ width: '250px', height: '48px' }}>
          <CheckCircle size={18} /> Concluir Follow-Up e Salvar
        </button>
      </div>
    </div>
  );
}
