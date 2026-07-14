import { describe, expect, it } from 'vitest';
import {
  calculateSemanticFluencySummary,
  createSemanticFluencyDraft,
  finalizeSemanticFluencyDraft,
  getSemanticFluencyDisplaySummary,
  getSemanticFluencyDraftKey,
  loadSemanticFluencyDraft,
  saveSemanticFluencyDraft,
  validateSemanticFluencyDraft,
} from './semanticFluency';

describe('calculateSemanticFluencySummary', () => {
  it('conta somente classificações válidas no total válido', () => {
    const responses = [
      { id: '1', term: 'gato', timestampSeconds: 2, classification: 'valid' },
      { id: '2', term: 'gato', timestampSeconds: 8, classification: 'repetition' },
      { id: '3', term: 'garfo', timestampSeconds: 18, classification: 'intrusion' },
      { id: '4', term: 'cão', timestampSeconds: 31, classification: 'valid' },
    ];

    const summary = calculateSemanticFluencySummary(responses);

    expect(summary.recordedResponses).toBe(4);
    expect(summary.validResponses).toBe(2);
    expect(summary.byClassification.repetition).toBe(1);
    expect(summary.byClassification.intrusion).toBe(1);
    expect(summary.denominator).toBe(4);
  });

  it('mantém palavras repetidas como registros distintos por ID', () => {
    const summary = calculateSemanticFluencySummary([
      { id: 'response-a', term: 'bola', timestampSeconds: 4, classification: 'valid' },
      { id: 'response-b', term: 'bola', timestampSeconds: 5, classification: 'valid' },
    ]);

    expect(summary.recordedResponses).toBe(2);
    expect(summary.validResponses).toBe(2);
  });

  it('agrupa produção e válidas em intervalos de 15 segundos', () => {
    const summary = calculateSemanticFluencySummary([
      { id: '1', timestampSeconds: 0, classification: 'valid' },
      { id: '2', timestampSeconds: 14.9, classification: 'repetition' },
      { id: '3', timestampSeconds: 15, classification: 'valid' },
      { id: '4', timestampSeconds: 30, classification: 'intrusion' },
      { id: '5', timestampSeconds: 60, classification: 'valid' },
    ]);

    expect(summary.intervals).toEqual([
      { startSeconds: 0, endSeconds: 15, recorded: 2, valid: 1 },
      { startSeconds: 15, endSeconds: 30, recorded: 1, valid: 1 },
      { startSeconds: 30, endSeconds: 45, recorded: 1, valid: 0 },
      { startSeconds: 45, endSeconds: 60, recorded: 1, valid: 1 },
    ]);
  });

  it('aceita uma aplicação sem produções', () => {
    expect(calculateSemanticFluencySummary([]).validResponses).toBe(0);
  });
});

describe('rascunho de fluência semântica', () => {
  it('salva e retoma o mesmo ID sem misturar paciente ou autor', () => {
    const storage = window.localStorage;
    storage.clear();
    const draft = createSemanticFluencyDraft({ patientId: 'patient-1', authorId: 'author-1' });
    const key = getSemanticFluencyDraftKey({ patientId: 'patient-1', authorId: 'author-1' });

    saveSemanticFluencyDraft(storage, key, {
      ...draft,
      context: { ...draft.context, category: 'Categoria definida pela profissional' },
    });

    const resumed = loadSemanticFluencyDraft(storage, key, 'patient-1');
    expect(resumed.id).toBe(draft.id);
    expect(resumed.context.category).toBe('Categoria definida pela profissional');
    expect(loadSemanticFluencyDraft(storage, key, 'patient-2')).toBeNull();
  });

  it('exige justificativa para decisão manual', () => {
    const draft = createSemanticFluencyDraft({ patientId: 'patient-1' });
    const errors = validateSemanticFluencyDraft({
      ...draft,
      context: { ...draft.context, category: 'Categoria A', instruction: 'Instrução registrada' },
      responses: [{ id: 'response-1', term: 'item', timestampSeconds: 5, classification: 'manual_decision', decisionNote: '' }],
    });

    expect(errors).toContain('Documente a decisão manual da produção 1.');
  });

  it('finaliza com versões, denominador e sem interpretação automática', () => {
    const draft = createSemanticFluencyDraft({ patientId: 'patient-1' });
    const { result, errors } = finalizeSemanticFluencyDraft({
      ...draft,
      context: {
        ...draft.context,
        category: 'Categoria A',
        instruction: 'Instrução registrada',
        elapsedSeconds: 60,
      },
      responses: [{ id: 'response-1', term: 'item', timestampSeconds: 5, classification: 'valid', decisionNote: '' }],
    }, '2026-07-14T12:00:00.000Z');

    expect(errors).toEqual([]);
    expect(result.status).toBe('completed');
    expect(result.objectiveSummary.validResponses).toBe(1);
    expect(result.objectiveSummary.denominator).toBe(1);
    expect(result.scoringVersion).toBe('1.0.0-descriptive');
    expect(result.clinicalInterpretation).toBe('');
  });
});

describe('compatibilidade com resultados antigos', () => {
  it('adapta o resumo legado sem alterar o registro original', () => {
    const legacy = { summary: { totalWords: 8, uniqueWords: 6 }, counts: { repetitions: 2 } };
    const display = getSemanticFluencyDisplaySummary(legacy);

    expect(display.validResponses).toBe(6);
    expect(display.recordedResponses).toBe(8);
    expect(display.byClassification.repetition).toBe(2);
    expect(display.legacy).toBe(true);
    expect(legacy.objectiveSummary).toBeUndefined();
  });
});
