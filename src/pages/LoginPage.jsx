import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import useStore from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setGuestMode, initGuestMode } = useStore();

  const handleGuestAccess = () => {
    setGuestMode(true);
    initGuestMode();
    navigate('/dashboard');
  };

  return <Login onGuestAccess={handleGuestAccess} />;
}
