import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FluencyModule from './FluencyModule';
import { getSemanticFluencyDraftKey } from '../store/assessments/semanticFluency';

const patient = { id: 'patient-field-test', name: 'Paciente de Teste' };

beforeEach(() => {
  window.localStorage.clear();
});

describe('Fluência Semântica — Evocação Lexical', () => {
  it('salva rascunho, retoma e finaliza usando o mesmo ID', async () => {
    const onSaveAssessment = vi.fn().mockResolvedValue({ success: true });
    const onComplete = vi.fn();
    const props = {
      patient,
      mode: 'verbal',
      draftScope: 'therapist-1',
      onBack: vi.fn(),
      onSaveAssessment,
      onComplete,
    };

    const firstRender = render(<FluencyModule {...props} />);
    fireEvent.change(screen.getByLabelText('Categoria definida pela profissional'), {
      target: { value: 'Categoria revisada pela profissional' },
    });
    fireEvent.change(screen.getByLabelText('Instrução utilizada'), {
      target: { value: 'Instrução registrada durante a aplicação' },
    });
    fireEvent.change(screen.getByLabelText('Produção literal'), { target: { value: 'gato' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar em 0s' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    const key = getSemanticFluencyDraftKey({ patientId: patient.id, authorId: 'therapist-1' });
    const persisted = JSON.parse(window.localStorage.getItem(key));
    expect(persisted.responses).toHaveLength(1);
    expect(persisted.responses[0].term).toBe('gato');
    const assessmentId = persisted.id;

    firstRender.unmount();
    render(<FluencyModule {...props} />);

    expect(screen.getByDisplayValue('Categoria revisada pela profissional')).toBeTruthy();
    expect(screen.getByDisplayValue('gato')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar registro descritivo' }));

    await waitFor(() => expect(onSaveAssessment).toHaveBeenCalledTimes(1));
    const [moduleName, result, entryId] = onSaveAssessment.mock.calls[0];
    expect(moduleName).toBe('fluency_verbal');
    expect(entryId).toBe(assessmentId);
    expect(result.id).toBe(assessmentId);
    expect(result.objectiveSummary.validResponses).toBe(1);
    expect(result.clinicalInterpretation).toBe('');
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it('bloqueia finalização sem categoria e instrução', async () => {
    const onSaveAssessment = vi.fn();
    render(
      <FluencyModule
        patient={patient}
        mode="verbal"
        draftScope="therapist-1"
        onBack={vi.fn()}
        onSaveAssessment={onSaveAssessment}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Finalizar registro descritivo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Informe a categoria aplicada.');
    expect(onSaveAssessment).not.toHaveBeenCalled();
  });
});
