import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import OrofacialMotorModule from '../components/OrofacialMotorModule';

export default function OrofacialMotorPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, saveAssessmentResults } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const patient = patients.find(p => p.id === patientId);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSave = async (results) => {
    setIsSaving(true);
    setError('');

    try {
      await saveAssessmentResults('orofacial_motor', results, null, patientId);

      setTimeout(() => {
        navigate(`/dashboard`);
      }, 500);
    } catch (err) {
      console.error('Erro ao salvar avaliação AMIOFE:', err);
      setError('Erro ao salvar. Tente novamente.');
      setIsSaving(false);
    }
  };

  if (!patient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Paciente não encontrado.</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgb(239, 68, 68)',
          borderRadius: '8px',
          color: 'rgb(239, 68, 68)',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      <OrofacialMotorModule
        patient={patient}
        onBack={handleBack}
        onSaveAssessment={handleSave}
      />

      {isSaving && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--secondary-color)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p>Salvando avaliação miofuncional...</p>
          </div>
        </div>
      )}
    </div>
  );
}
