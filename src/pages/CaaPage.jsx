import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComunicaTeaModule from '../components/ComunicaTeaModule';
import useStore from '../store/useStore';

export default function CaaPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  return (
    <div className="glass-panel card" style={{ padding: '2.5rem 2rem' }}>
      <ComunicaTeaModule
        patient={patient}
        onBack={() => navigate('/dashboard')}
      />
    </div>
  );
}
