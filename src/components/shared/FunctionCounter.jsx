import React from 'react';

const variantColors = {
  success: { badge: 'badge-success' },
  danger: { badge: 'badge-danger' },
  warning: { badge: 'badge-warning' },
  primary: { badge: '' },
};

export default function FunctionCounter({ label, count, onClick, variant = 'success' }) {
  const badgeClass = variantColors[variant]?.badge || 'badge-success';

  return (
    <button
      className="btn btn-secondary"
      onClick={onClick}
      style={{ height: '48px', justifyContent: 'space-between', padding: '0 0.75rem' }}
    >
      <span>{label}</span>
      <span className={`badge ${badgeClass}`}>{count}</span>
    </button>
  );
}
