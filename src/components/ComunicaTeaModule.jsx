import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Trash2, Camera } from 'lucide-react';

export default function ComunicaTeaModule({ patient, onBack }) {
  // Lista inicial de cartões padrão da prancha de CAA (Padrão de Cores Oficial)
  const defaultCards = [
    { id: 'c1', text: 'Eu', category: 'sujeito', icon: '👤' },
    { id: 'c2', text: 'Você', category: 'sujeito', icon: '👥' },
    { id: 'c3', text: 'Mamãe', category: 'sujeito', icon: '👩' },
    { id: 'c4', text: 'Papai', category: 'sujeito', icon: '👨' },
    { id: 'c5', text: 'Fonoaudióloga', category: 'sujeito', icon: '👩‍⚕️' },

    { id: 'c6', text: 'Quero', category: 'acao', icon: '👉' },
    { id: 'c7', text: 'Brincar', category: 'acao', icon: '🧸' },
    { id: 'c8', text: 'Comer', category: 'acao', icon: '🍽️' },
    { id: 'c9', text: 'Beber', category: 'acao', icon: '🥤' },
    { id: 'c10', text: 'Ir ao banheiro', category: 'acao', icon: '🚾' },
    { id: 'c11', text: 'Ajudar', category: 'acao', icon: '🤝' },

    { id: 'c12', text: 'Água', category: 'objeto', icon: '💧' },
    { id: 'c13', text: 'Brinquedo', category: 'objeto', icon: '🚗' },
    { id: 'c14', text: 'Bolacha', category: 'objeto', icon: '🍪' },
    { id: 'c15', text: 'Tablet', category: 'objeto', icon: '📱' },
    { id: 'c16', text: 'Parquinho', category: 'objeto', icon: '🛝' },
    { id: 'c17', text: 'Casa', category: 'objeto', icon: '🏠' },

    { id: 'c18', text: 'Sim', category: 'social', icon: '✅' },
    { id: 'c19', text: 'Não', category: 'social', icon: '❌' },
    { id: 'c20', text: 'Por favor', category: 'social', icon: '🙏' },
    { id: 'c21', text: 'Obrigado', category: 'social', icon: '🙌' },
    { id: 'c22', text: 'Estou feliz', category: 'social', icon: '😊' },
    { id: 'c23', text: 'Estou triste', category: 'social', icon: '😢' }
  ];

  const [cards, setCards] = useState(() => {
    const stored = localStorage.getItem(`caa_cards_${patient.id}`);
    return stored ? JSON.parse(stored) : defaultCards;
  });

  const [phrase, setPhrase] = useState([]);
  
  // Estados para Criação de Cartão pela Câmera
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('objeto');
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`caa_cards_${patient.id}`, JSON.stringify(cards));
  }, [cards, patient.id]);

  // Função para adicionar cartão à barra de frase
  const handleAddCardToPhrase = (card) => {
    setPhrase(prev => [...prev, card]);
    // Fala o termo individual imediatamente ao tocar (feedback auditivo imediato do PECS)
    speakText(card.text);
  };

  // Remove cartão da barra de frase
  const handleRemoveCardFromPhrase = (idx) => {
    setPhrase(prev => prev.filter((_, i) => i !== idx));
  };

  // Limpa toda a frase construída
  const handleClearPhrase = () => {
    setPhrase([]);
  };

  // Sintetizador de voz nativo (Web Speech API)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancela leituras anteriores
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // velocidade amigável e pausada
      utterance.pitch = 1.1; // tom mais acolhedor
      window.speechSynthesis.speak(utterance);
    }
  };

  // Lê a frase inteira acumulada
  const handleSpeakPhrase = () => {
    if (phrase.length === 0) return;
    const fullText = phrase.map(c => c.text).join(' ');
    speakText(fullText);
  };

  // Câmera para Snapshot
  const startWebcam = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 320, facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setCameraError('Não foi possível conectar à câmera.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleOpenModal = () => {
    setShowCameraModal(true);
    setNewCardText('');
    setTimeout(startWebcam, 200);
  };

  const handleCloseModal = () => {
    stopWebcam();
    setShowCameraModal(false);
  };

  // Captura o snapshot e converte em Base64
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current || !newCardText) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Desenha o vídeo no canvas quadrado
    ctx.drawImage(video, 0, 0, 150, 150);
    const dataUrl = canvas.toDataURL('image/png');

    const newCard = {
      id: 'custom_' + Date.now(),
      text: newCardText,
      category: newCardCategory,
      image: dataUrl // armazena base64
    };

    setCards(prev => [...prev, newCard]);
    handleCloseModal();
  };

  // Remove um cartão personalizado cadastrado
  const handleRemoveCustomCard = (cardId, e) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente apagar este cartão personalizado?")) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setPhrase(prev => prev.filter(c => c.id !== cardId));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ComunicaTEA - Prancha de CAA Vocalizada</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente: <strong>{patient.name}</strong></span>
      </div>

      {/* Phrase Builder Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', minHeight: '120px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BARRA DE CONSTRUÇÃO DE FRASE</span>
          <div className="caa-phrase-bar">
            {phrase.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Clique nas imagens abaixo para formular uma frase...</span>
            ) : (
              phrase.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`caa-card caa-${card.category}`}
                  onClick={() => handleRemoveCardFromPhrase(idx)}
                  style={{ width: '80px', height: '80px', flexShrink: 0, padding: '0.25rem' }}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.text} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                  )}
                  <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{card.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Controls for phrase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSpeakPhrase}
            disabled={phrase.length === 0}
            style={{ width: '130px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Play size={16} /> Falar Frase
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleClearPhrase}
            disabled={phrase.length === 0}
            style={{ width: '130px', height: '44px' }}
          >
            <Trash2 size={14} /> Limpar
          </button>
        </div>
      </div>

      {/* Custom Card Trigger and Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#fbbf24', borderRadius: '2px' }} /> Sujeitos
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#34d399', borderRadius: '2px' }} /> Ações
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#60a5fa', borderRadius: '2px' }} /> Objetos/Lugares
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#a78bfa', borderRadius: '2px' }} /> Sociais
          </span>
        </div>

        <button className="btn btn-secondary" onClick={handleOpenModal} style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)', fontWeight: 700 }}>
          <Camera size={16} /> Adicionar Foto Real / Cartão
        </button>
      </div>

      {/* CAA Cards Board */}
      <div className="caa-grid" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {cards.map(card => (
          <div 
            key={card.id} 
            className={`caa-card caa-${card.category}`}
            onClick={() => handleAddCardToPhrase(card)}
            style={{ position: 'relative', minHeight: '105px' }}
          >
            {card.id.startsWith('custom_') && (
              <button 
                onClick={(e) => handleRemoveCustomCard(card.id, e)}
                style={{ position: 'absolute', top: '4px', right: '4px', border: 'none', background: 'rgba(239,68,68,0.2)', color: 'var(--danger-color)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                title="Apagar cartão"
              >
                ×
              </button>
            )}

            {card.image ? (
              <img src={card.image} alt={card.text} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem' }}>{card.icon}</span>
            )}
            <span className="caa-card-text">{card.text}</span>
          </div>
        ))}
      </div>

      {/* Webcam Snap Modal */}
      {showCameraModal && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel card" style={{ maxWidth: '400px', width: '100%', padding: '1.75rem', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Novo Cartão Personalizado</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '180px', height: '180px', border: '2px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden', background: '#000', position: 'relative' }}>
                {cameraError ? (
                  <p style={{ padding: '2rem', fontSize: '0.75rem', color: 'var(--danger-color)', textContent: 'center' }}>{cameraError}</p>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <canvas ref={canvasRef} width="150" height="150" style={{ display: 'none' }} />
            </div>

            <div className="form-group">
              <label>Nome da Palavra (Texto do Cartão)</label>
              <input type="text" value={newCardText} onChange={e => setNewCardText(e.target.value)} placeholder="Ex: Primo Lucas" required />
            </div>

            <div className="form-group">
              <label>Categoria Gramatical</label>
              <select value={newCardCategory} onChange={e => setNewCardCategory(e.target.value)}>
                <option value="sujeito">Sujeito (Amarelo - Pessoas/Quem)</option>
                <option value="acao">Ação (Verde - Verbos/Quero/Ir)</option>
                <option value="objeto">Objeto/Lugar (Azul - Coisas/Onde)</option>
                <option value="social">Social (Lilás - Sentimentos/Cumprimento)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleCaptureSnapshot} 
                disabled={!newCardText || !!cameraError}
                style={{ flex: 1 }}
              >
                Capturar e Salvar
              </button>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
