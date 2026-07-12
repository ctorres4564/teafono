import { create } from 'zustand';
import { createAssessment, ASSESSMENT_STATUS } from './assessmentModel';

const useAssessmentStore = create((set, get) => ({
  assessments: [],

  loadAssessments: (patientId) => {
    const all = get().assessments;
    return all.filter(a => a.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAssessment: (assessmentId) => {
    return get().assessments.find(a => a.id === assessmentId) || null;
  },

  addAssessment: ({ patientId, type, context = {} }) => {
    const assessment = createAssessment({ patientId, type, context });
    set(state => ({ assessments: [...state.assessments, assessment] }));
    return assessment;
  },

  updateAssessment: (assessmentId, updates) => {
    set(state => ({
      assessments: state.assessments.map(a =>
        a.id === assessmentId
          ? { ...a, ...updates, updatedAt: new Date().toISOString() }
          : a
      ),
    }));
  },

  saveResults: (assessmentId, results, status = ASSESSMENT_STATUS.COMPLETED) => {
    const now = new Date().toISOString();
    set(state => ({
      assessments: state.assessments.map(a =>
        a.id === assessmentId
          ? {
              ...a,
              results,
              status,
              completedAt: status === ASSESSMENT_STATUS.COMPLETED ? now : null,
              updatedAt: now,
            }
          : a
      ),
    }));
  },

  deleteAssessment: (assessmentId) => {
    set(state => ({
      assessments: state.assessments.filter(a => a.id !== assessmentId),
    }));
  },

  setClinicalNotes: (assessmentId, notes) => {
    get().updateAssessment(assessmentId, { clinicalNotes: notes });
  },

  persistToPatient: (patientId, persistCallback) => {
    const patientAssessments = get().loadAssessments(patientId);
    const completed = patientAssessments.filter(a => a.status === ASSESSMENT_STATUS.COMPLETED);
    if (completed.length > 0 && persistCallback) {
      persistCallback(patientId, completed);
    }
  },

  migratePatientHistory: (history) => {
    if (!history || !Array.isArray(history)) return [];

    const migrated = history
      .filter(entry => entry && entry.id && entry.results)
      .map(entry => {
        const keys = Object.keys(entry.results);
        const firstKey = keys[0];
        return {
          id: entry.id.startsWith('ast_') ? entry.id : `ast_migrated_${entry.id}`,
          patientId: '',
          type: firstKey || 'unknown',
          status: ASSESSMENT_STATUS.COMPLETED,
          createdAt: entry.date || new Date().toISOString(),
          updatedAt: entry.date || new Date().toISOString(),
          completedAt: entry.date || new Date().toISOString(),
          results: entry.results[firstKey] || entry.results,
          clinicalNotes: '',
          version: 1,
          context: { migratedFrom: 'patient.history', originalId: entry.id },
        };
      });

    return migrated;
  },
}));

export default useAssessmentStore;
