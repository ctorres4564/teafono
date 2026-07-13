import React from 'react';

const VARIANTS = {
  saved: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadow: 'rgba(16,185,129,0.4)',
    text: 'Dados salvos com sucesso!',
  },
  'saved-offline': {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: 'rgba(245,158,11,0.4)',
    text: 'Dados salvos localmente. Sincronização com a nuvem falhou — tentaremos novamente mais tarde.',
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    shadow: 'rgba(239,68,68,0.4)',
    text: 'Erro ao salvar dados. Verifique o console para detalhes.',
  },
};

export default function SaveStatusToast({ status }) {
  const variant = VARIANTS[status];
  if (!variant) return null;

  return (
    <div style={{
      position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
      padding: '1rem 1.5rem', borderRadius: '12px',
      background: variant.background,
      color: '#fff', fontWeight: 700, fontSize: '0.9rem',
      boxShadow: `0 4px 20px ${variant.shadow}`,
      animation: 'fadeIn 0.3s ease',
    }}>
      {variant.text}
    </div>
  );
}
