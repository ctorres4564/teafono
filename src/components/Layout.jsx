import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Heart, Sun, Moon, Settings, LogOut, MessagesSquare } from 'lucide-react';
import TherapistSettings from './TherapistSettings';
import useStore from '../store/useStore';

export default function Layout() {
  const navigate = useNavigate();
  const {
    isLightMode,
    toggleTheme,
    currentUser,
    isGuestMode,
    activePatient,
    logout,
    therapistSettings,
    saveTherapistSettings,
  } = useStore();
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <header className="app-header no-print">
        <Link to="/dashboard" className="brand" style={{ textDecoration: 'none' }}>
          <Heart size={28} style={{ color: 'var(--secondary-color)', fill: 'rgba(139,92,246,0.1)' }} />
          <span>TeaFono</span>
        </Link>

        <div className="header-actions">
          {currentUser && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRight: '1px solid var(--border-color)', paddingRight: '0.75rem', marginRight: '0.25rem' }}>
              Olá, <strong>{currentUser.displayName || currentUser.email}</strong>
            </span>
          )}
          {isGuestMode && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', borderRight: '1px solid var(--border-color)', paddingRight: '0.75rem', marginRight: '0.25rem' }}>
              Modo Convidado (Local)
            </span>
          )}
          {activePatient && window.location.pathname === '/dashboard' && (
            <Link to={`/caa/${activePatient.id}`} className="btn btn-secondary" style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>
              <MessagesSquare size={16} /> Comunicação Alternativa
            </Link>
          )}
          <button className="btn btn-secondary btn-icon" onClick={() => setShowSettingsModal(true)} title="Configurações do Profissional">
            <Settings size={18} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Alternar tema">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {(currentUser || isGuestMode) && (
            <button className="btn btn-secondary btn-icon" onClick={handleLogout} title="Sair da Conta" style={{ color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="app-container">
        <Outlet />
      </main>

      {showSettingsModal && (
        <TherapistSettings
          settings={therapistSettings}
          onSave={(s) => { saveTherapistSettings(s); setShowSettingsModal(false); }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
