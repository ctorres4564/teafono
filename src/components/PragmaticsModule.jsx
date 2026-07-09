import React, { useState, useEffect, useRef } from 'react';
import { calculatePragmatics } from '../utils/teaEvaluations';
import { ArrowLeft, Play, Square, RefreshCw, MessageSquare, Volume2 } from 'lucide-react';

export default function PragmaticsModule({ patient, onBack, onSaveAssessment }) {
  // Contadores locais de atos por meios
  const [verbal, setVerbal] = useState(0);
  const [vocal, setVocal] = useState(0);
  const [gestual, setGestual] = useState(0);

  // Contador de funções comunicativas (auxiliares)
  const [functions, setFunctions] = useState({
    pedido: 0,
    protesto: 0,
    comentario: 0,
    resposta: 0,
    narrativa: 0
  });

  // Estados do Cronômetro
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(timerRef.current);
            playBeep();
            alert("Tempo de observação de 5 minutos concluído!");
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {
      console.warn("AudioContext não suportado ou bloqueado:", e);
    }
  };

  const handleIncrementMean = (type) => {
    if (!isRunning) {
      // Opcional: avisar que o cronômetro deve estar ativo para contar
      setIsRunning(true);
    }
    if (type === 'verbal') setVerbal(prev => prev + 1);
    if (type === 'vocal') setVocal(prev => prev + 1);
    if (type === 'gestual') setGestual(prev => prev + 1);
  };

  const handleIncrementFunction = (field) => {
    if (!isRunning) setIsRunning(true);
    setFunctions(prev => ({
      ...prev,
      [field]: prev[field] + 1
    }));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(300);
    setVerbal(0);
    setVocal(0);
    setGestual(0);
    setFunctions({
      pedido: 0,
      protesto: 0,
      comentario: 0,
      resposta: 0,
      narrativa: 0
    });
  };

  const handleSave = () => {
    const elapsedSeconds = 300 - timeLeft;
    const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 5;
    
    const results = calculatePragmatics({
      verbal,
      vocal,
      gestual
    }, Number(elapsedMinutes.toFixed(2)));

    // Adiciona as funções ao laudo para riqueza de detalhes
    results.functions = functions;

    onSaveAssessment('pragmatics', results);
  };

  const totalActs = verbal + vocal + gestual;
  const elapsedSeconds = 300 - timeLeft;
  const minutesDisplay = Math.floor(timeLeft / 60);
  const secondsDisplay = timeLeft % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Perfil Funcional de Pragmática (Fernandes)</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente: <strong>{patient.name}</strong></span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Durante a interação livre ou brinquedo semiestruturado com a criança, inicie o cronômetro. Clique nos botões de <strong>Meios Comunicativos</strong> correspondentes sempre que o paciente realizar um ato de comunicação direcionado ao terapeuta.
      </p>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Counters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Means buttons */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Registrar Meio de Comunicação</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleIncrementMean('verbal')}
                style={{ height: '90px', flexDirection: 'column', fontSize: '0.95rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{verbal}</span>
                <span>Meio Verbal (Palavras)</span>
              </button>

              <button 
                className="btn btn-primary" 
                onClick={() => handleIncrementMean('vocal')}
                style={{ height: '90px', flexDirection: 'column', fontSize: '0.95rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{vocal}</span>
                <span>Meio Vocal (Sons/Sílaba)</span>
              </button>

              <button 
                className="btn btn-primary" 
                onClick={() => handleIncrementMean('gestual')}
                style={{ height: '90px', flexDirection: 'column', fontSize: '0.95rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{gestual}</span>
                <span>Meio Gestual (Gestos)</span>
              </button>
            </div>
          </div>

          {/* Sub-functions buttons */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Mapear Funções Comunicativas (Opcional)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => handleIncrementFunction('pedido')} style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}>
                <span>Pedido</span> <span className="badge badge-success">{functions.pedido}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleIncrementFunction('protesto')} style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}>
                <span>Protesto</span> <span className="badge badge-danger">{functions.protesto}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleIncrementFunction('comentario')} style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}>
                <span>Comentário</span> <span className="badge badge-warning">{functions.comentario}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleIncrementFunction('resposta')} style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}>
                <span>Resposta</span> <span className="badge badge-success">{functions.resposta}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleIncrementFunction('narrativa')} style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}>
                <span>Narrativa</span> <span className="badge badge-success" style={{ background: 'var(--secondary-color)', color: '#fff' }}>{functions.narrativa}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right: Timer & Real-time Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Timer card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CRONÔMETRO DE OBSERVAÇÃO</span>
            
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', color: isRunning ? 'var(--secondary-color)' : 'var(--text-primary)' }}>
              {String(minutesDisplay).padStart(2, '0')}:{String(secondsDisplay).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button className="btn btn-primary" onClick={() => setIsRunning(!isRunning)} style={{ flex: 2 }}>
                {isRunning ? <Square size={16} /> : <Play size={16} />} {isRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button className="btn btn-secondary btn-icon" onClick={handleReset} title="Resetar Contadores">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Stats card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Perfil em Tempo Real</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total de Atos Comunicativos:</span>
                <strong style={{ fontSize: '1rem' }}>{totalActs} atos</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tempo Decorrido:</span>
                <strong>{Math.floor(elapsedSeconds / 60)} min {elapsedSeconds % 60} seg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Frequência Comunicativa:</span>
                <strong style={{ color: 'var(--secondary-color)', fontSize: '1rem' }}>
                  {totalActs > 0 ? (totalActs / (elapsedSeconds > 0 ? elapsedSeconds / 60 : 5)).toFixed(1) : 0} atos/min
                </strong>
              </div>
            </div>

            {totalActs > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DISTRIBUIÇÃO DOS MEIOS</span>
                <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((verbal / totalActs) * 100)}%`, background: 'var(--success-color)' }} title="Verbal" />
                  <div style={{ width: `${Math.round((vocal / totalActs) * 100)}%`, background: 'var(--warning-color)' }} title="Vocal" />
                  <div style={{ width: `${Math.round((gestual / totalActs) * 100)}%`, background: 'var(--primary-color)' }} title="Gestual" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  <span>Verbal: {Math.round((verbal / totalActs) * 100)}%</span>
                  <span>Vocal: {Math.round((vocal / totalActs) * 100)}%</span>
                  <span>Gestual: {Math.round((gestual / totalActs) * 100)}%</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem', height: '44px' }}>
              Finalizar e Salvar Pragmática
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
