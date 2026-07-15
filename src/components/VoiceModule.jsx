import React, { useState, useRef } from 'react';
import { ArrowLeft, Volume2, AlertCircle, CheckCircle, Mic, Square } from 'lucide-react';
import AssessmentHeader from './shared/AssessmentHeader';
import {
  GRBAS_SCALES,
  RESONANCE_TYPES,
  calculateVoiceGrade,
  calculateDSI,
  classifyDSI,
  interpretGRBAS,
  getVoiceRecommendations,
  classifyVoicePathology,
  VOICE_NORMS
} from '../utils/voiceAssessment';

export default function VoiceModule({ patient, onBack, onSave }) {
  const [section, setSection] = useState('grbas'); // 'grbas', 'resonance', 'pitch', 'results'

  // GRBAS scores (0-3)
  const [grbas, setGrbas] = useState({
    grade: 0,
    roughness: 0,
    breathiness: 0,
    asthenia: 0,
    strain: 0
  });

  // Resonance
  const [resonance, setResonance] = useState('normal');

  // Pitch parameters
  const [pitch, setPitch] = useState({
    estimatedFrequency: '',
    maxFrequency: '',
    minFrequency: '',
    range: '',
    jitter: '',
    shimmer: ''
  });

  // Gender/age for norms
  const [voiceGender, setVoiceGender] = useState('child');

  // Observations
  const [observations, setObservations] = useState('');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sections = [
    { id: 'grbas', label: 'GRBAS - Qualidade Vocal' },
    { id: 'resonance', label: 'Ressonância' },
    { id: 'pitch', label: 'Pitch e Frequência' },
    { id: 'results', label: 'Resumo e Recomendações' }
  ];

  const updateGRBAS = (param, value) => {
    setGrbas({ ...grbas, [param]: value });
  };

  const handleSave = () => {
    const results = {
      grbas,
      resonance,
      pitch,
      voiceGender,
      observations,
      overallGrade: calculateVoiceGrade(grbas),
      pathologyType: classifyVoicePathology(grbas, resonance),
      dsi: pitch.maxFrequency && pitch.minFrequency ?
           calculateDSI({
             maxFrequency: parseFloat(pitch.maxFrequency),
             minFrequency: parseFloat(pitch.minFrequency),
             jitter: parseFloat(pitch.jitter) || 0,
             shimmer: parseFloat(pitch.shimmer) || 0
           }) : null,
      audioUrl: audioUrl,
      timestamp: new Date().toISOString()
    };
    onSave(results);
  };

  return (
    <div className="assessment-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <AssessmentHeader
        title="Avaliação de Voz (GRBAS)"
        subtitle="Protocolo de Avaliação Perceptivo-Auditiva de Qualidade Vocal"
        onBack={onBack}
      />

      {/* Section Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: section === s.id ? 'var(--primary-color)' : 'var(--bg-secondary)',
              color: section === s.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: section === s.id ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* GRBAS Section */}
      {section === 'grbas' && (
        <div className="glass-panel card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            <Volume2 size={20} style={{ marginRight: '0.5rem' }} /> GRBAS - Escala de Qualidade Vocal
          </h3>

          <div style={{ background: 'rgba(59,130,246,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Instrução:</strong> Avalie a voz do paciente em amostra de fala espontânea (~3-5 minutos).
              Escala 0 = Normal | 3 = Grave
            </p>
          </div>

          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={18} /> Gravação de Amostra Vocal
            </h4>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--danger-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Mic size={16} /> Iniciar Gravação
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--danger-color)',
                    border: '1px solid var(--danger-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Square size={16} fill="currentColor" /> Parar Gravação
                </button>
              )}
              {isRecording && <span style={{ color: 'var(--danger-color)', fontWeight: 600, animation: 'pulse 2s infinite' }}>Gravando...</span>}
            </div>

            {audioUrl && (
              <div style={{ marginTop: '0.5rem' }}>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </div>
            )}
          </div>

          {/* GRBAS Parameters */}
          {Object.entries(grbas).map(([param, value]) => (
            <div key={param} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {param === 'grade' ? 'G - Grade (Grau)' :
                 param === 'roughness' ? 'R - Roughness (Aspereza)' :
                 param === 'breathiness' ? 'B - Breathiness (Soprosidade)' :
                 param === 'asthenia' ? 'A - Asthenia (Astenia)' :
                 param === 'strain' ? 'S - Strain (Tensão)' : param}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {[0, 1, 2, 3].map(score => (
                  <button
                    key={score}
                    onClick={() => updateGRBAS(param, score)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: value === score ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      background: value === score ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: value === score ? 700 : 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{score}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {GRBAS_SCALES[param][score]}
                    </div>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {param === 'grade' && 'Qualidade geral da voz' ||
                 param === 'roughness' && 'Presença de aspereza/rouquidão' ||
                 param === 'breathiness' && 'Presença de soprosidade/escape aéreo' ||
                 param === 'asthenia' && 'Redução de intensidade/voz fraca' ||
                 param === 'strain' && 'Presença de tensão/esforço muscular'}
              </p>
            </div>
          ))}

          <button
            onClick={() => setSection('resonance')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            Continuar → Ressonância
          </button>
        </div>
      )}

      {/* Resonance Section */}
      {section === 'resonance' && (
        <div className="glass-panel card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Avaliação de Ressonância
          </h3>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Tipo de Ressonância
            </label>

            {Object.entries(RESONANCE_TYPES).map(([key, label]) => (
              <div key={key} style={{ marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setResonance(key)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: resonance === key ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: resonance === key ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    fontWeight: resonance === key ? 700 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {resonance === key && <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
                  {label}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(251,191,36,0.1)', borderRadius: '6px', borderLeft: '4px solid rgb(251,191,36)' }}>
            <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
              <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              <strong>Se Hiponasal:</strong> Investigar congestão nasal, rinite, desvio septal<br/>
              <strong>Se Hipernasal:</strong> Investigar insuficiência velofaríngea, possível fissura palatina
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setSection('grbas')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={() => setSection('pitch')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Pitch Section */}
      {section === 'pitch' && (
        <div className="glass-panel card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Pitch e Frequência Fundamental
          </h3>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Gênero/Idade para Normas
            </label>
            <select
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="child">Criança (3-12 anos)</option>
              <option value="female_adult">Mulher Adulta</option>
              <option value="male_adult">Homem Adulto</option>
            </select>
          </div>

          {/* Frequency Inputs */}
          {[
            { key: 'estimatedFrequency', label: 'Frequência Estimada (Hz)' },
            { key: 'maxFrequency', label: 'Frequência Máxima (Hz)' },
            { key: 'minFrequency', label: 'Frequência Mínima (Hz)' },
            { key: 'range', label: 'Range de Frequência (semitons)' },
            { key: 'jitter', label: 'Jitter (%) - Variação Frequência' },
            { key: 'shimmer', label: 'Shimmer (dB) - Variação Amplitude' }
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {label}
              </label>
              <input
                type="number"
                value={pitch[key]}
                onChange={(e) => setPitch({ ...pitch, [key]: e.target.value })}
                placeholder="Valor opcional"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => setSection('resonance')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={() => setSection('results')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              Resumo →
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {section === 'results' && (
        <div className="glass-panel card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Resumo e Recomendações
          </h3>

          {/* Overall Grade */}
          <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Grau Geral de Disfonia:
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
              {calculateVoiceGrade(grbas) === 0 ? 'Normal' :
               calculateVoiceGrade(grbas) === 1 ? 'Leve' :
               calculateVoiceGrade(grbas) === 2 ? 'Moderada' : 'Grave'}
            </div>
          </div>

          {/* Pathology Classification */}
          <div style={{ padding: '1rem', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid rgb(251,191,36)' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Tipo de Alteração:
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-color)' }}>
              {classifyVoicePathology(grbas, resonance)}
            </div>
          </div>

          {/* Interpretations */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Achados Principais:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              {interpretGRBAS(grbas).map((interp, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {interp}
                </li>
              ))}
            </ul>
          </div>

          {/* Observations */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Observações Clínicas:
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas adicionais sobre qualidade vocal, comportamentos associados, etc."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Recommendations */}
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid rgb(16,185,129)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Recomendações:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              {getVoiceRecommendations(grbas, resonance).map((rec, i) => (
                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <strong>{rec.type}:</strong> {rec.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setSection('pitch')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              ← Editar
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'rgb(34, 197, 94)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              ✓ Salvar Avaliação de Voz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
