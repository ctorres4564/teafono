import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

export default function AssessmentTimer({ initialSeconds = 300, onTimeUp, onTick }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
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
            if (onTimeUp) onTimeUp();
            return initialSeconds;
          }
          if (onTick) onTick(prev - 1);
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
    } catch (e) {
      console.warn("AudioContext não suportado:", e);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  };

  const toggleRunning = () => setIsRunning(prev => !prev);

  const minutesDisplay = Math.floor(timeLeft / 60);
  const secondsDisplay = timeLeft % 60;
  const elapsedSeconds = initialSeconds - timeLeft;

  return (
    <div className="glass-panel" style={{
      padding: '1.5rem', display: 'flex', flexDirection: 'column',
      gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)'
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        CRONÔMETRO DE OBSERVAÇÃO
      </span>

      <div style={{
        fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace',
        color: isRunning ? 'var(--secondary-color)' : 'var(--text-primary)'
      }}>
        {String(minutesDisplay).padStart(2, '0')}:{String(secondsDisplay).padStart(2, '0')}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
        <button className="btn btn-primary" onClick={toggleRunning} style={{ flex: 2 }}>
          {isRunning ? <Square size={16} /> : <Play size={16} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button className="btn btn-secondary btn-icon" onClick={handleReset} title="Resetar">
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Decorrido: {Math.floor(elapsedSeconds / 60)}min {elapsedSeconds % 60}s
      </div>
    </div>
  );
}
