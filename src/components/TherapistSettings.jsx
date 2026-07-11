import React, { useState } from 'react';
import { X, Shield, Save } from 'lucide-react';

export default function TherapistSettings({ settings, onSave, onClose }) {
  const [name, setName] = useState(settings?.name || '');
  const [crfa, setCrfa] = useState(settings?.crfa || '');
  const [clinicName, setClinicName] = useState(settings?.clinicName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, crfa, clinicName });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} className="text-secondary" /> Configurações do Profissional
          </h3>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onClose}
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Nome Completo do Fonoaudiólogo(a)</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ex: Dra. Ana Silva Souza"
              required 
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Registro Profissional (CRFa)</label>
            <input 
              type="text" 
              value={crfa} 
              onChange={e => setCrfa(e.target.value)} 
              placeholder="Ex: CRFa 4-12345"
              required 
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Nome da Clínica / Consultório (opcional)</label>
            <input 
              type="text" 
              value={clinicName} 
              onChange={e => setClinicName(e.target.value)} 
              placeholder="Ex: Clínica FonoFlow"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Salvar Configurações
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 0.5 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
