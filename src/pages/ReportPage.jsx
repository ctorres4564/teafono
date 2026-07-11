import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportModule from '../components/ReportModule';
import useStore from '../store/useStore';

export default function ReportPage() {
  const { patientId, reportId } = useParams();
  const navigate = useNavigate();
  const { patients, therapistSettings } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}><p>Paciente não encontrado.</p></div>;
  }

  return (
    <ReportModule
      patient={patient}
      assessmentId={reportId}
      therapistSettings={therapistSettings}
      onBack={() => navigate('/dashboard')}
    />
  );
}
