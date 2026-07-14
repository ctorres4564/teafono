import { generateAssessmentId, generateSecureId } from '../../utils/idGenerator';

export const SEMANTIC_FLUENCY_MODULE_VERSION = '1.1.0-field-test';
export const SEMANTIC_FLUENCY_SCORING_VERSION = '1.0.0-descriptive';
export const SEMANTIC_FLUENCY_STIMULUS_VERSION = 'professional-defined';
export const SEMANTIC_FLUENCY_PURPOSE = 'Registro estruturado e apoio à formulação clínica sob responsabilidade da profissional. Não realiza diagnóstico, classificação normativa ou recomendação automática.';

export const CLINICAL_ACTION_PRIORITIES = [
  { id: 'not_defined', label: 'Não definida' },
  { id: 'low', label: 'Baixa' },
  { id: 'medium', label: 'Média' },
  { id: 'high', label: 'Alta' },
];

export const SEMANTIC_FLUENCY_CLASSIFICATIONS = [
  { id: 'valid', label: 'Válida' },
  { id: 'repetition', label: 'Repetição' },
  { id: 'intrusion', label: 'Intrusão' },
  { id: 'variation', label: 'Variação' },
  { id: 'proper_name', label: 'Nome próprio' },
  { id: 'unintelligible', label: 'Não inteligível' },
  { id: 'manual_decision', label: 'Decisão manual documentada' },
];

const CLASSIFICATION_IDS = new Set(SEMANTIC_FLUENCY_CLASSIFICATIONS.map(item => item.id));
const ACTION_PRIORITY_IDS = new Set(CLINICAL_ACTION_PRIORITIES.map(item => item.id));

export function createSemanticFluencyDraft({
  patientId,
  authorId = 'guest',
  professional = {},
  now = new Date().toISOString(),
}) {
  return {
    id: generateAssessmentId(),
    patientId,
    authorId,
    type: 'semantic_fluency',
    status: 'draft',
    context: {
      category: '',
      instruction: '',
      instructionVersion: 'professional-entered-v1',
      durationSeconds: 60,
      elapsedSeconds: 0,
    },
    moduleVersion: SEMANTIC_FLUENCY_MODULE_VERSION,
    stimulusSetVersion: SEMANTIC_FLUENCY_STIMULUS_VERSION,
    scoringVersion: SEMANTIC_FLUENCY_SCORING_VERSION,
    responses: [],
    objectiveSummary: calculateSemanticFluencySummary([]),
    clinicalNotes: '',
    clinicalCriteria: [],
    clinicalSynthesis: '',
    plannedActions: [],
    professionalReview: {
      professionalName: String(professional.name || '').trim(),
      professionalRegistration: String(professional.registration || '').trim(),
      responsibilityAccepted: false,
      reviewedAt: null,
    },
    clinicalInterpretation: '',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function createSemanticFluencyCriterion() {
  return {
    id: `criterion_${generateSecureId()}`,
    description: '',
    supportingEvidence: '',
    source: '',
    version: 'professional-defined-v1',
  };
}

export function createSemanticFluencyAction() {
  return {
    id: `action_${generateSecureId()}`,
    objective: '',
    description: '',
    rationale: '',
    priority: 'not_defined',
    timeframe: '',
    followUpIndicator: '',
  };
}

export function createSemanticFluencyResponse({ term, timestampSeconds, classification = 'valid', decisionNote = '' }) {
  return {
    id: `response_${generateSecureId()}`,
    term: String(term || '').trim(),
    timestampSeconds: clampTimestamp(timestampSeconds),
    classification: CLASSIFICATION_IDS.has(classification) ? classification : 'manual_decision',
    decisionNote: String(decisionNote || '').trim(),
  };
}

export function clampTimestamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(60, Math.max(0, Number(numeric.toFixed(1))));
}

export function calculateSemanticFluencySummary(responses) {
  const safeResponses = Array.isArray(responses) ? responses : [];
  const byClassification = Object.fromEntries(
    SEMANTIC_FLUENCY_CLASSIFICATIONS.map(item => [item.id, 0])
  );
  const intervals = [
    { startSeconds: 0, endSeconds: 15, recorded: 0, valid: 0 },
    { startSeconds: 15, endSeconds: 30, recorded: 0, valid: 0 },
    { startSeconds: 30, endSeconds: 45, recorded: 0, valid: 0 },
    { startSeconds: 45, endSeconds: 60, recorded: 0, valid: 0 },
  ];

  safeResponses.forEach(response => {
    const classification = CLASSIFICATION_IDS.has(response?.classification)
      ? response.classification
      : 'manual_decision';
    byClassification[classification] += 1;

    const timestamp = clampTimestamp(response?.timestampSeconds);
    const intervalIndex = timestamp >= 60 ? 3 : Math.min(3, Math.floor(timestamp / 15));
    intervals[intervalIndex].recorded += 1;
    if (classification === 'valid') intervals[intervalIndex].valid += 1;
  });

  return {
    recordedResponses: safeResponses.length,
    validResponses: byClassification.valid,
    byClassification,
    intervals,
    denominator: safeResponses.length,
  };
}

export function validateSemanticFluencyDraft(draft) {
  const errors = [];
  if (!draft?.patientId) errors.push('Paciente não identificado.');
  if (!draft?.context?.category?.trim()) errors.push('Informe a categoria aplicada.');
  if (!draft?.context?.instruction?.trim()) errors.push('Registre a instrução utilizada.');

  const responses = Array.isArray(draft?.responses) ? draft.responses : [];
  responses.forEach((response, index) => {
    if (!response?.id) errors.push(`A produção ${index + 1} não possui ID.`);
    if (!String(response?.term || '').trim()) errors.push(`A produção ${index + 1} está vazia.`);
    if (!CLASSIFICATION_IDS.has(response?.classification)) {
      errors.push(`A produção ${index + 1} possui classificação inválida.`);
    }
    if (response?.classification === 'manual_decision' && !String(response?.decisionNote || '').trim()) {
      errors.push(`Documente a decisão manual da produção ${index + 1}.`);
    }
  });

  const criteria = Array.isArray(draft?.clinicalCriteria) ? draft.clinicalCriteria : [];
  criteria.forEach((criterion, index) => {
    if (!criterion?.id) errors.push(`O critério clínico ${index + 1} não possui ID.`);
    if (!String(criterion?.description || '').trim()) {
      errors.push(`Descreva o critério clínico ${index + 1}.`);
    }
    if (!String(criterion?.supportingEvidence || '').trim()) {
      errors.push(`Registre a evidência considerada no critério clínico ${index + 1}.`);
    }
  });

  const actions = Array.isArray(draft?.plannedActions) ? draft.plannedActions : [];
  actions.forEach((action, index) => {
    if (!action?.id) errors.push(`A ação profissional ${index + 1} não possui ID.`);
    if (!String(action?.objective || '').trim()) {
      errors.push(`Informe o objetivo da ação profissional ${index + 1}.`);
    }
    if (!String(action?.description || '').trim()) {
      errors.push(`Descreva a ação profissional ${index + 1}.`);
    }
    if (!String(action?.rationale || '').trim()) {
      errors.push(`Registre a justificativa da ação profissional ${index + 1}.`);
    }
    if (!ACTION_PRIORITY_IDS.has(action?.priority)) {
      errors.push(`A ação profissional ${index + 1} possui prioridade inválida.`);
    }
  });

  if (!draft?.professionalReview?.professionalName?.trim()) {
    errors.push('Informe o nome da profissional responsável.');
  }
  if (!draft?.professionalReview?.professionalRegistration?.trim()) {
    errors.push('Informe o registro profissional.');
  }
  if (draft?.professionalReview?.responsibilityAccepted !== true) {
    errors.push('Confirme a revisão e a responsabilidade profissional antes de finalizar.');
  }

  return errors;
}

export function finalizeSemanticFluencyDraft(draft, now = new Date().toISOString()) {
  const errors = validateSemanticFluencyDraft(draft);
  if (errors.length > 0) return { errors, result: null };

  const responses = draft.responses.map(response => ({
    ...response,
    term: String(response.term).trim(),
    timestampSeconds: clampTimestamp(response.timestampSeconds),
    decisionNote: String(response.decisionNote || '').trim(),
  }));
  const objectiveSummary = calculateSemanticFluencySummary(responses);
  const elapsedSeconds = clampTimestamp(draft.context.elapsedSeconds);
  const durationMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
  const ratePerMinute = durationMinutes > 0
    ? Number((objectiveSummary.validResponses / durationMinutes).toFixed(1))
    : 0;
  const clinicalCriteria = (draft.clinicalCriteria || []).map(criterion => ({
    ...criterion,
    description: String(criterion.description || '').trim(),
    supportingEvidence: String(criterion.supportingEvidence || '').trim(),
    source: String(criterion.source || '').trim(),
    version: String(criterion.version || 'professional-defined-v1').trim(),
  }));
  const plannedActions = (draft.plannedActions || []).map(action => ({
    ...action,
    objective: String(action.objective || '').trim(),
    description: String(action.description || '').trim(),
    rationale: String(action.rationale || '').trim(),
    priority: ACTION_PRIORITY_IDS.has(action.priority) ? action.priority : 'not_defined',
    timeframe: String(action.timeframe || '').trim(),
    followUpIndicator: String(action.followUpIndicator || '').trim(),
  }));

  return {
    errors: [],
    result: {
      ...draft,
      status: 'completed',
      context: { ...draft.context, elapsedSeconds },
      responses,
      objectiveSummary,
      clinicalNotes: String(draft.clinicalNotes || '').trim(),
      clinicalCriteria,
      clinicalSynthesis: String(draft.clinicalSynthesis || '').trim(),
      plannedActions,
      professionalReview: {
        professionalName: String(draft.professionalReview.professionalName || '').trim(),
        professionalRegistration: String(draft.professionalReview.professionalRegistration || '').trim(),
        responsibilityAccepted: true,
        reviewedAt: now,
      },
      clinicalInterpretation: '',
      // Mantém leitores antigos funcionando sem substituir o resumo descritivo versionado.
      summary: {
        totalWords: objectiveSummary.validResponses,
        uniqueWords: objectiveSummary.validResponses,
        ratePerMinute,
      },
      updatedAt: now,
      completedAt: now,
    },
  };
}

export function getSemanticFluencyDraftKey({ patientId, authorId = 'guest' }) {
  return `teafono_draft_semantic_fluency:${authorId}:${patientId}`;
}

export function saveSemanticFluencyDraft(storage, key, draft) {
  const updated = {
    ...draft,
    status: 'draft',
    objectiveSummary: calculateSemanticFluencySummary(draft.responses),
    professionalReview: {
      ...draft.professionalReview,
      responsibilityAccepted: false,
      reviewedAt: null,
    },
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function loadSemanticFluencyDraft(storage, key, expectedPatientId) {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.patientId !== expectedPatientId || parsed?.status !== 'draft') return null;
    return {
      ...parsed,
      responses: Array.isArray(parsed.responses) ? parsed.responses : [],
      objectiveSummary: calculateSemanticFluencySummary(parsed.responses),
      clinicalCriteria: Array.isArray(parsed.clinicalCriteria) ? parsed.clinicalCriteria : [],
      clinicalSynthesis: String(parsed.clinicalSynthesis || ''),
      plannedActions: Array.isArray(parsed.plannedActions) ? parsed.plannedActions : [],
      professionalReview: {
        professionalName: String(parsed.professionalReview?.professionalName || ''),
        professionalRegistration: String(parsed.professionalReview?.professionalRegistration || ''),
        responsibilityAccepted: false,
        reviewedAt: null,
      },
      clinicalInterpretation: '',
    };
  } catch {
    return null;
  }
}

export function getSemanticFluencyDisplaySummary(result) {
  if (result?.objectiveSummary) return result.objectiveSummary;

  const legacySummary = result?.summary || {};
  const validResponses = Number(legacySummary.uniqueWords ?? legacySummary.totalWords ?? 0) || 0;
  return {
    recordedResponses: Number(legacySummary.totalWords ?? validResponses) || 0,
    validResponses,
    byClassification: {
      valid: validResponses,
      repetition: Number(result?.counts?.repetitions || 0),
    },
    intervals: [],
    denominator: Number(legacySummary.totalWords ?? validResponses) || 0,
    legacy: true,
  };
}
