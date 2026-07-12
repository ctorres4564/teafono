import React from 'react';

export default function ProgressBar({ items }) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        DISTRIBUIÇÃO
      </span>
      <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              width: `${Math.round((item.value / total) * 100)}%`,
              background: item.color,
              transition: 'width 0.3s ease'
            }}
            title={item.label}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
        {items.map((item, idx) => (
          <span key={idx}>
            {item.label}: {Math.round((item.value / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}
