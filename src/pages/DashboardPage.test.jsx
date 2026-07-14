import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../components/Dashboard', () => ({
  default: ({ onStartAssessment }) => (
    <div>
      <button onClick={() => onStartAssessment('fluency_verbal')}>Abrir fluência semântica</button>
      <button onClick={() => onStartAssessment('fluency_speech')}>Abrir fluência da fala</button>
    </div>
  ),
}));

vi.mock('../store/useStore', () => {
  const useStore = () => ({
    patients: [],
    activePatientId: 'patient-1',
    selectPatient: vi.fn(),
    addPatient: vi.fn(),
    deletePatient: vi.fn(),
    updatePatient: vi.fn(),
    importBackupList: vi.fn(),
  });
  useStore.getState = () => ({
    getActivePatient: () => ({ id: 'patient-1' }),
  });
  return { default: useStore };
});

import DashboardPage from './DashboardPage';

function CurrentPath() {
  return <output aria-label="rota atual">{useLocation().pathname}</output>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
      <CurrentPath />
    </MemoryRouter>
  );
}

describe('rotas dos módulos de fluência', () => {
  it('abre a evocação lexical com patientId e modo na ordem esperada', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir fluência semântica' }));
    expect(screen.getByLabelText('rota atual')).toHaveTextContent('/fluency/patient-1/verbal');
  });

  it('abre a fluência da fala com patientId e modo na ordem esperada', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir fluência da fala' }));
    expect(screen.getByLabelText('rota atual')).toHaveTextContent('/fluency/patient-1/speech');
  });
});
