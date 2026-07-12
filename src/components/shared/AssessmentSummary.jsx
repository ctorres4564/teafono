import React from 'react';

export default function AssessmentSummary({ items, children }) {
  return (
    <div className="glass-panel" style={{
      padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'
    }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Resumo em Tempo Real
      </h4>

      {items && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.label}:</span>
              <strong style={item.highlight ? { color: 'var(--secondary-color)', fontSize: '1rem' } : {}}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
