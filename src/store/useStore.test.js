import { describe, it, expect, beforeEach } from 'vitest';
import useStore from './useStore';

function getStore() {
  return useStore.getState();
}

beforeEach(() => {
  useStore.setState({
    patients: [],
    activePatientId: null,
    activeReportId: null,
    currentUser: null,
    isGuestMode: false,
    authLoading: false,
  });
  localStorage.clear();
});

describe('addPatient', () => {
  it('deve adicionar um paciente com campos obrigatórios', () => {
    getStore().addPatient({
      name: 'Arthur',
      age: 5,
      gender: 'Masculino',
    });
    const { patients } = getStore();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('Arthur');
    expect(patients[0].age).toBe(5);
    expect(patients[0].history).toEqual([]);
  });

  it('deve iniciar com history vazio', () => {
    getStore().addPatient({ name: 'Teste', age: 3, gender: 'Feminino' });
    expect(getStore().patients[0].history).toEqual([]);
  });
});

describe('saveAssessmentResults', () => {
  it('deve adicionar entrada no history do paciente', () => {
    getStore().addPatient({ name: 'Maria', age: 4, gender: 'Feminino' });
    const pid = getStore().patients[0].id;

    getStore().saveAssessmentResults('anamnese', { queixa: 'atraso de fala' }, null, pid);

    const patient = getStore().patients[0];
    expect(patient.history).toHaveLength(1);
    expect(patient.history[0].results.anamnese).toBeDefined();
    expect(patient.history[0].results.anamnese.queixa).toBe('atraso de fala');
  });

  it('deve preservar entradas existentes no history', () => {
    getStore().addPatient({ name: 'João', age: 6, gender: 'Masculino' });
    const pid = getStore().patients[0].id;

    getStore().saveAssessmentResults('mchat', { score: 3 }, null, pid);
    getStore().saveAssessmentResults('anamnese', { queixa: 'gagueira' }, null, pid);

    const patient = getStore().patients[0];
    expect(patient.history).toHaveLength(2);
    expect(patient.history[0].results.anamnese.queixa).toBe('gagueira');
    expect(patient.history[1].results.mchat.score).toBe(3);
  });

  it('deve atualizar entrada existente quando entryId é fornecido', () => {
    getStore().addPatient({ name: 'Pedro', age: 7, gender: 'Masculino' });
    const pid = getStore().patients[0].id;

    getStore().saveAssessmentResults('anamnese', { queixa: 'inicial' }, null, pid);
    const entryId = getStore().patients[0].history[0].id;

    getStore().saveAssessmentResults('anamnese', { queixa: 'atualizada', observacao: 'melhora' }, entryId, pid);

    const patient = getStore().patients[0];
    expect(patient.history).toHaveLength(1);
    expect(patient.history[0].results.anamnese.queixa).toBe('atualizada');
    expect(patient.history[0].results.anamnese.observacao).toBe('melhora');
  });
});

describe('updatePatient', () => {
  it('deve preservar campos extras não especificados', () => {
    getStore().addPatient({ name: 'Ana', age: 5, gender: 'Feminino' });
    const pid = getStore().patients[0].id;

    const state = getStore();
    const patients = JSON.parse(JSON.stringify(state.patients));
    patients[0].guardianName = 'Mãe da Ana';
    patients[0].pregnancyHistory = 'Gravidez normal';
    useStore.setState({ patients });

    getStore().updatePatient({ id: pid, name: 'Ana Clara', age: 6, gender: 'Feminino' });

    const updated = getStore().patients[0];
    expect(updated.name).toBe('Ana Clara');
    expect(updated.age).toBe(6);
    expect(updated.guardianName).toBe('Mãe da Ana');
    expect(updated.pregnancyHistory).toBe('Gravidez normal');
    expect(updated.history).toEqual([]);
  });
});

describe('persistPatients', () => {
  it('deve salvar no localStorage com chave correta', () => {
    getStore().addPatient({ name: 'Lucas', age: 8, gender: 'Masculino' });
    const stored = localStorage.getItem('teafono_patients');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Lucas');
  });

  it('deve usar chave com uid quando usuário logado', () => {
    useStore.setState({ currentUser: { uid: 'test-123' } });
    getStore().addPatient({ name: 'Test User', age: 3, gender: 'Feminino' });

    const storedWithUid = localStorage.getItem('teafono_patients_test-123');
    const storedGeneric = localStorage.getItem('teafono_patients');

    expect(storedWithUid).not.toBeNull();
    expect(storedGeneric).toBeNull();
  });
});

describe('importBackupList', () => {
  it('deve garantir que history seja array', () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      getStore().importBackupList([
        { id: '1', name: 'Backup', history: null },
        { id: '2', name: 'Backup2' },
      ]);
      const { patients } = getStore();
      expect(patients).toHaveLength(2);
      expect(Array.isArray(patients[0].history)).toBe(true);
      expect(Array.isArray(patients[1].history)).toBe(true);
    } finally {
      window.confirm = originalConfirm;
    }
  });
});

describe('saveAssessmentResults - verificação completa de campos no localStorage', () => {
  function createFullForm() {
    return {
      identification: { name: 'João', birthDate: '2020-01-01', age: '5', sex: 'Masculino', responsible: 'Maria', phone: '11999999999', schooling: 'Pré-escola' },
      mainComplaint: { firstWordsAge: '12', firstSentencesAge: '24', babbling: 'sim', estimatedWordsComprehended: '200', estimatedWordsSpoken: '50', comprehension: 'adequate', production: 'Clara', phonologicalChanges: 'troca /k/ por /t/', stuttering: 'não', stutteringFrequency: '', stutteringSeverity: null, voice: 'Normal', rhythm: 'Adequados' },
      swallowing: { breastfed: 'sim', breastfeedingDuration: '6 meses', liquid: true, pasty: true, choppedSolid: false, choking: 'não', chokingFrequency: '', chewingDifficulty: 'não', suctionOralBreathing: 'não', enteral: 'não' },
      auditory: { hearingComplaints: 'não', recurrentOtitis: 'sim', otitisEpisodes: '3', priorAssessment: 'sim', priorAssessmentDate: '2025-06-01', priorAssessmentResult: 'normal', referredToORL: 'sim' },
      medical: { prematurity: 'não', chronicNeurological: '', surgeriesHospitalizations: '', currentMedications: '' },
      global: { motorMilestones: 'sim', motorDetails: '', socialInteraction: 'Adequado', attentionHyperactivityRepetitive: '', sleep: 'Regular', sleepDescription: '' },
      observation: { breathing: 'Nasal', orofacialPosture: 'Normal', tongueMobility: 'Adequada', tongueDetails: '', lipTone: 'Normal', suctionSwallowing: 'Adequada', refluxOralOdor: 'não', feedingObserved: 'não', feedingConsistency: '', feedingBehavior: '' },
      instruments: { formalTests: 'ABFW - 10/01/2026', parentalScales: 'M-CHAT, BAMBI', schoolReports: 'sim' },
      diagnosis: { mainDiagnosis: 'Atraso de linguagem', differential1: 'TEA', differential2: '', affectedAreas: { speech: true, receptiveLanguage: true, expressiveLanguage: true, voice: false, fluency: false, swallowing: false, socialCommunication: false, auditoryProcessing: false }, severity: 'Moderado', etiology: 'functional' },
    };
  }

  function flattenKeys(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        acc.push(...flattenKeys(obj[k], prefix + k + '.'));
      } else {
        acc.push(prefix + k);
      }
      return acc;
    }, []);
  }

  it('deve preservar todos os campos no history em memória', () => {
    getStore().addPatient({ name: 'Maria', age: 4, gender: 'Feminino' });
    const pid = getStore().patients[0].id;
    const form = createFullForm();

    getStore().saveAssessmentResults('anamnese', form, null, pid);

    const saved = getStore().patients[0].history[0].results.anamnese;
    const savedKeys = flattenKeys(saved);
    const originalKeys = flattenKeys(form);
    expect(savedKeys.sort()).toEqual(originalKeys.sort());
    Object.keys(form.identification).forEach(k => expect(saved.identification[k]).toBe(form.identification[k]));
    Object.keys(form.mainComplaint).forEach(k => expect(saved.mainComplaint[k]).toBe(form.mainComplaint[k]));
    Object.keys(form.diagnosis.affectedAreas).forEach(k => expect(saved.diagnosis.affectedAreas[k]).toBe(form.diagnosis.affectedAreas[k]));
  });

  it('deve preservar todos os campos no localStorage após saveAssessmentResults', () => {
    getStore().addPatient({ name: 'Pedro', age: 6, gender: 'Masculino' });
    const pid = getStore().patients[0].id;
    const form = createFullForm();

    getStore().saveAssessmentResults('anamnese', form, null, pid);

    const stored = localStorage.getItem('teafono_patients');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored);
    const savedAnamnese = parsed.find(p => p.id === pid).history[0].results.anamnese;
    expect(savedAnamnese).toBeDefined();
    const savedKeys = flattenKeys(savedAnamnese);
    const originalKeys = flattenKeys(form);
    expect(savedKeys.sort()).toEqual(originalKeys.sort());
    expect(savedAnamnese.identification.name).toBe('João');
    expect(savedAnamnese.mainComplaint.firstWordsAge).toBe('12');
    expect(savedAnamnese.mainComplaint.babbling).toBe('sim');
    expect(savedAnamnese.swallowing.liquid).toBe(true);
    expect(savedAnamnese.auditory.recurrentOtitis).toBe('sim');
    expect(savedAnamnese.medical.prematurity).toBe('não');
    expect(savedAnamnese.global.motorMilestones).toBe('sim');
    expect(savedAnamnese.observation.breathing).toBe('Nasal');
    expect(savedAnamnese.instruments.formalTests).toBe('ABFW - 10/01/2026');
    expect(savedAnamnese.diagnosis.mainDiagnosis).toBe('Atraso de linguagem');
    expect(savedAnamnese.diagnosis.affectedAreas.speech).toBe(true);
    expect(savedAnamnese.diagnosis.severity).toBe('Moderado');
    expect(savedAnamnese.diagnosis.etiology).toBe('functional');
  });

  it('deve preservar campos após ciclo completo: save → JSON → parse → compare', () => {
    getStore().addPatient({ name: 'Ana', age: 3, gender: 'Feminino' });
    const pid = getStore().patients[0].id;
    const form = createFullForm();

    getStore().saveAssessmentResults('anamnese', form, null, pid);

    const stored = localStorage.getItem('teafono_patients');
    const parsed = JSON.parse(stored);
    const saved = parsed.find(p => p.id === pid).history[0].results.anamnese;

    // deep compare every leaf value
    function deepCompare(orig, saved, path) {
      for (const k of Object.keys(orig)) {
        const v = orig[k];
        const sv = saved[k];
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          deepCompare(v, sv, path + '.' + k);
        } else {
          expect(sv).toBe(v);
        }
      }
    }
    deepCompare(form, saved, 'root');
  });

  it('deve preservar dados de pacientes existentes após salvar anamnese', () => {
    getStore().addPatient({ name: 'Carlos', age: 5, gender: 'Masculino', diagnosis: 'TEA', birthDate: '2019-01-01', speechComplaint: 'Atraso de fala' });
    const pid = getStore().patients[0].id;

    const existingName = getStore().patients[0].name;
    const existingDiagnosis = getStore().patients[0].diagnosis;

    const form = createFullForm();
    getStore().saveAssessmentResults('anamnese', form, null, pid);

    const stored = localStorage.getItem('teafono_patients');
    const parsed = JSON.parse(stored);
    const patient = parsed.find(p => p.id === pid);

    expect(patient.name).toBe(existingName);
    expect(patient.diagnosis).toBe(existingDiagnosis);
    expect(patient.history).toHaveLength(1);
  });

  it('deve atualizar entrada existente sem duplicar', () => {
    getStore().addPatient({ name: 'Luiza', age: 7, gender: 'Feminino' });
    const pid = getStore().patients[0].id;
    const form1 = createFullForm();
    form1.identification.name = 'Luiza Editada';

    getStore().saveAssessmentResults('anamnese', form1, null, pid);
    const entryId = getStore().patients[0].history[0].id;

    const form2 = JSON.parse(JSON.stringify(form1));
    form2.identification.name = 'Luiza Final';

    getStore().saveAssessmentResults('anamnese', form2, entryId, pid);

    const stored = localStorage.getItem('teafono_patients');
    const parsed = JSON.parse(stored);
    const patient = parsed.find(p => p.id === pid);

    expect(patient.history).toHaveLength(1);
    expect(patient.history[0].id).toBe(entryId);
    expect(patient.history[0].results.anamnese.identification.name).toBe('Luiza Final');
  });

  it('deve preservar outras avaliações (mchat, etc.) ao salvar anamnese', () => {
    getStore().addPatient({ name: 'Rafael', age: 4, gender: 'Masculino' });
    const pid = getStore().patients[0].id;

    getStore().saveAssessmentResults('mchat', { score: 5, risk: 'alto' }, null, pid);
    getStore().saveAssessmentResults('anamnese', createFullForm(), null, pid);

    const stored = localStorage.getItem('teafono_patients');
    const parsed = JSON.parse(stored);
    const patient = parsed.find(p => p.id === pid);

    const mchatEntry = patient.history.find(h => h.results.mchat);
    expect(mchatEntry).toBeDefined();
    expect(mchatEntry.results.mchat.score).toBe(5);
    expect(mchatEntry.results.mchat.risk).toBe('alto');
  });
});

describe('initGuestMode', () => {
  it('deve carregar pacientes do localStorage quando existem', () => {
    const mockData = [
      { id: '1', name: 'Local Patient', history: [], isSelected: true },
    ];
    localStorage.setItem('teafono_patients', JSON.stringify(mockData));

    getStore().initGuestMode();

    const { patients } = getStore();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('Local Patient');
  });
});
