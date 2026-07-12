import React from 'react';

export default function CounterButton({ count, label, onClick, color = 'var(--secondary-color)' }) {
  return (
    <button
      className="btn btn-primary"
      onClick={onClick}
      style={{
        height: '90px', flexDirection: 'column', fontSize: '0.95rem',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
      }}
    >
      <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{count}</span>
      <span>{label}</span>
    </button>
  );
}
