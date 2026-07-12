import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AssessmentHeader({ title, patientName, onBack }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button className="btn btn-secondary" onClick={onBack}>
        <ArrowLeft size={16} /> Voltar
      </button>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Paciente: <strong>{patientName}</strong>
      </span>
    </div>
  );
}
