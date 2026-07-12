import React from 'react';

export default function ScoringButtons({ options, currentValue, onChange, size = 'md' }) {
  const btnSize = size === 'sm'
    ? { padding: '0.4rem', fontSize: '0.75rem', minWidth: '60px' }
    : { padding: '0.5rem', fontSize: '0.8rem' };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {options.map(opt => (
        <button
          key={opt.val}
          className={`score-btn ${currentValue === opt.val ? 'active-1' : ''}`}
          onClick={() => onChange(opt.val)}
          style={btnSize}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
