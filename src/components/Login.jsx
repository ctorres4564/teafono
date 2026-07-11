import React, { useState } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from '../firebase';
import { updateProfile } from 'firebase/auth';
import { Heart, Mail, Lock, User, ShieldAlert, CheckCircle, ArrowLeft, RefreshCw, Compass } from 'lucide-react';

export default function Login({ onGuestAccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translateError = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'O endereço de e-mail inserido é inválido.';
      case 'auth/user-disabled':
        return 'Esta conta de usuário foi desativada.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Escolha uma senha com pelo menos 6 caracteres.';
      case 'auth/missing-password':
        return 'Por favor, insira a sua senha.';
      default:
        return 'Ocorreu um erro na autenticação. Tente novamente.';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      setMessage('Conta criada com sucesso!');
    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 40%), #0b0f19',
      padding: '1.5rem'
    }}>
      <div className="glass-panel card animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
            padding: '0.75rem',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
          }}>
            <Heart size={32} style={{ color: '#fff', fill: 'rgba(255,255,255,0.2)' }} />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '0.5rem' }}>
            TeaFono
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {mode === 'login' && 'Faça login para gerenciar suas fichas clínicas'}
            {mode === 'signup' && 'Crie sua conta profissional de fonoaudiologia'}
            {mode === 'forgot' && 'Insira seu e-mail para redefinir sua senha'}
          </p>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: 'var(--danger-color)',
            fontSize: '0.85rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            color: 'var(--success-color)',
            fontSize: '0.85rem'
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* FORMS */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>E-mail</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="exemplo@clinica.com" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Senha</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                  style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Sua senha secreta" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} disabled={isLoading}>
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Entrar no Sistema'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Nome Completo</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Dra. Roberta Rezende" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="exemplo@clinica.com" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha (mínimo 6 caracteres)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Defina sua senha" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Repita a senha" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} disabled={isLoading}>
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Criar minha Conta'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>E-mail Cadastrado</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="exemplo@clinica.com" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} disabled={isLoading}>
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Enviar E-mail de Recuperação'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={16} /> Voltar ao Login
            </button>
          </form>
        )}

        {/* Footer Switching Mode */}
        {mode === 'login' && (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span>
              Não tem uma conta?{' '}
              <button 
                onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                style={{ color: 'var(--secondary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Cadastre-se
              </button>
            </span>
          </div>
        )}

        {mode === 'signup' && (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            <span>
              Já possui uma conta?{' '}
              <button 
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ color: 'var(--secondary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Faça Login
              </button>
            </span>
          </div>
        )}

        {/* Guest Mode Option */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <button 
            onClick={onGuestAccess} 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            <Compass size={14} /> Acessar Modo Convidado (Local Offline)
          </button>
        </div>
      </div>
    </div>
  );
}
