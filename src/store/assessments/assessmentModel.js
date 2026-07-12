export const ASSESSMENT_TYPES = {
  MCHAT: 'mchat',
  PRAGMATICS: 'pragmatics',
  BAMBI: 'bambi',
  VOCABULARY: 'vocabulary',
  FLUENCY_VERBAL: 'fluency_verbal',
  FLUENCY_SPEECH: 'fluency_speech',
  PHONOLOGY: 'phonology',
};

export const ASSESSMENT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

let versionCounter = 1;

export function createAssessment({ patientId, type, context = {} }) {
  const now = new Date().toISOString();
  return {
    id: `ast_${Date.now()}_${String(versionCounter++).padStart(3, '0')}`,
    patientId,
    type,
    status: ASSESSMENT_STATUS.DRAFT,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    results: {},
    clinicalNotes: '',
    version: 1,
    context,
  };
}

export function isAssessment(obj) {
  return obj
    && typeof obj.id === 'string'
    && typeof obj.patientId === 'string'
    && typeof obj.type === 'string'
    && obj.id.startsWith('ast_');
}
