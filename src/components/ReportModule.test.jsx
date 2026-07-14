import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReportModule from './ReportModule';

const patient = {
  id: 'patient-1',
  name: 'Paciente de Teste',
  age: 7,
  gender: 'Feminino',
  diagnosis: '',
  history: [{
    id: 'assessment-1',
    date: '2026-07-14T12:00:00.000Z',
    results: {
      fluency_verbal: {
        context: { category: 'Categoria autoral', instruction: 'Instrução registrada' },
        objectiveSummary: {
          recordedResponses: 2,
          validResponses: 1,
          byClassification: { repetition: 1 },
        },
        clinicalNotes: 'Observação objetiva da profissional.',
        clinicalCriteria: [{
          id: 'criterion-1',
          description: 'Critério clínico aprovado',
          supportingEvidence: 'Evidência registrada por item',
          source: 'Protocolo interno',
        }],
        clinicalSynthesis: 'Síntese escrita pela profissional.',
        plannedActions: [{
          id: 'action-1',
          objective: 'Objetivo de acompanhamento',
          description: 'Ação definida pela profissional',
          rationale: 'Justificativa clínica registrada',
          timeframe: '30 dias',
          followUpIndicator: 'Novo registro descritivo',
        }],
        professionalReview: {
          professionalName: 'Dra. Ana Silva',
          professionalRegistration: 'CRFa 4-12345',
          responsibilityAccepted: true,
          reviewedAt: '2026-07-14T12:00:00.000Z',
        },
      },
    },
  }],
};

describe('ReportModule como apoio clínico', () => {
  it('exibe conteúdo autoral separado e não oferece plano automático', () => {
    render(
      <ReportModule
        patient={patient}
        assessmentId="assessment-1"
        therapistSettings={{ name: 'Dra. Ana Silva', crfa: 'CRFa 4-12345' }}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Relatório de Apoio Clínico' })).toBeInTheDocument();
    expect(screen.getByText('Critério clínico aprovado')).toBeInTheDocument();
    expect(screen.getByText('Síntese escrita pela profissional.')).toBeInTheDocument();
    expect(screen.getByText('Objetivo de acompanhamento')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gerar PTS com IA' })).not.toBeInTheDocument();
    expect(screen.queryByText('Orientações e Condutas Recomendadas')).not.toBeInTheDocument();
    expect(screen.queryByText('Hipótese Diagnóstica')).not.toBeInTheDocument();
  });
});
