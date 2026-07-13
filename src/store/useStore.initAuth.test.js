import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockOnAuthStateChanged, mockLoadPatientsFromFirestore, mockSavePatientToFirestore } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
  mockLoadPatientsFromFirestore: vi.fn(),
  mockSavePatientToFirestore: vi.fn(),
}));

vi.mock('../firebase', () => ({
  isFirebaseEnabled: vi.fn(() => true),
  savePatientToFirestore: mockSavePatientToFirestore,
  deletePatientFromFirestore: vi.fn(),
  loadPatientsFromFirestore: mockLoadPatientsFromFirestore,
  auth: {},
  signOut: vi.fn(),
  onAuthStateChanged: mockOnAuthStateChanged,
}));

import useStore from './useStore';

const UID = 'sonia-uid-123';
const mockUser = { uid: UID, displayName: 'Sônia Torres', email: 'sonia@test.com' };

function createPatient(overrides = {}) {
  return {
    id: overrides.id || 'tp_' + Date.now() + Math.random(),
    name: overrides.name || 'Paciente Teste',
    age: overrides.age || 5,
    gender: overrides.gender || 'Masculino',
    diagnosis: overrides.diagnosis || '',
    birthDate: overrides.birthDate || '2020-01-01',
    speechComplaint: overrides.speechComplaint || '',
    createdAt: overrides.createdAt || new Date().toISOString(),
    history: overrides.history || [],
    isSelected: overrides.isSelected ?? false,
    ...overrides,
  };
}

function simulateInitAuth(user, firestorePatients, localUserData, localGuestData) {
  localStorage.clear();
  mockSavePatientToFirestore.mockClear();
  mockLoadPatientsFromFirestore.mockClear();
  mockOnAuthStateChanged.mockClear();

  if (localUserData) {
    localStorage.setItem(`teafono_patients_${UID}`, JSON.stringify(localUserData));
  }
  if (localGuestData) {
    localStorage.setItem('teafono_patients', JSON.stringify(localGuestData));
  }

  const localList = localUserData || localGuestData || [];
  const mergedList = [...(firestorePatients || [])];
  for (const lp of localList) {
    if (!mergedList.find(m => m.id === lp.id)) {
      mergedList.push({ ...lp });
    }
  }

  let callCount = 0;
  mockSavePatientToFirestore.mockResolvedValue({ success: true });
  mockLoadPatientsFromFirestore.mockImplementation(() => {
    callCount++;
    if (callCount >= 2 && mergedList.length > (firestorePatients?.length || 0)) {
      return Promise.resolve([...mergedList]);
    }
    return Promise.resolve(firestorePatients || []);
  });
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
    setTimeout(() => cb(user), 0);
    return () => {};
  });

  return new Promise((resolve) => {
    useStore.getState().initAuth();
    setTimeout(() => resolve(), 200);
  });
}

describe('initAuth', () => {
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
    mockSavePatientToFirestore.mockClear();
    mockLoadPatientsFromFirestore.mockClear();
    mockOnAuthStateChanged.mockClear();
  });

  it('1. paciente apenas no Firestore deve aparecer na lista', async () => {
    const firestorePatient = createPatient({ id: 'f1', name: 'Theo' });
    await simulateInitAuth(mockUser, [firestorePatient], null, null);

    const { patients, currentUser } = useStore.getState();
    expect(currentUser?.uid).toBe(UID);
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('Theo');
  });

  it('2. paciente apenas no localStorage do uid deve aparecer e ser sincronizado ao Firestore', async () => {
    const localPatient = createPatient({ id: 'l1', name: 'LocalOnly' });
    await simulateInitAuth(mockUser, [], [localPatient], null);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('LocalOnly');

    const savedToFirestore = mockSavePatientToFirestore.mock.calls;
    expect(savedToFirestore.length).toBeGreaterThanOrEqual(1);
    const savedPat = savedToFirestore.find(c => c[0].id === 'l1');
    expect(savedPat).toBeDefined();
    expect(savedPat[1]).toBe(UID);
  });

  it('3. paciente nos dois deve aparecer uma única vez sem duplicação', async () => {
    const commonPatient = createPatient({ id: 'c1', name: 'Comum', createdAt: '2025-01-01T00:00:00.000Z' });
    const firestoreOnly = createPatient({ id: 'f2', name: 'SoFirestore', createdAt: '2025-01-01T00:00:00.000Z' });
    const localOnly = createPatient({ id: 'l2', name: 'SoLocal', createdAt: '2025-06-01T00:00:00.000Z' });

    await simulateInitAuth(mockUser, [commonPatient, firestoreOnly], [commonPatient, localOnly], null);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(3);
    const names = patients.map(p => p.name).sort();
    expect(names).toEqual(['Comum', 'SoFirestore', 'SoLocal']);
  });

  it('4. paciente local ausente no Firestore (Theo) deve ser sincronizado', async () => {
    const firestorePatients = [
      createPatient({ id: 'f_a', name: 'Alice', createdAt: '2025-01-01T00:00:00.000Z' }),
      createPatient({ id: 'f_b', name: 'Beto', createdAt: '2025-01-01T00:00:00.000Z' }),
      createPatient({ id: 'f_c', name: 'Carol', createdAt: '2025-01-01T00:00:00.000Z' }),
    ];
    const localPatients = [
      ...firestorePatients.map(p => ({ ...p })),
      createPatient({ id: 'l_theo', name: 'Theo', createdAt: '2025-06-01T00:00:00.000Z' }),
    ];

    await simulateInitAuth(mockUser, firestorePatients, localPatients, null);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(4);
    expect(patients.find(p => p.name === 'Theo')).toBeDefined();

    const theoSync = mockSavePatientToFirestore.mock.calls.find(c => c[0].id === 'l_theo');
    expect(theoSync).toBeDefined();
    expect(theoSync[1]).toBe(UID);
  });

  it('5. dados do guest (teafono_patients) são migrados quando usuário não tem localStorage próprio', async () => {
    const firestorePatient = createPatient({ id: 'f1', name: 'MeuPaciente' });
    const guestPatient = createPatient({ id: 'g1', name: 'GuestData' });

    await simulateInitAuth(mockUser, [firestorePatient], null, [guestPatient]);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(2);
    expect(patients.find(p => p.id === 'f1').name).toBe('MeuPaciente');
    expect(patients.find(p => p.id === 'g1').name).toBe('GuestData');

    const guestKey = localStorage.getItem('teafono_patients');
    expect(guestKey).not.toBeNull();
    const guestParsed = JSON.parse(guestKey);
    expect(guestParsed).toHaveLength(1);
    expect(guestParsed[0].name).toBe('GuestData');
  });

  it('6. dados do guest são migrados apenas quando não há dados do usuário nem Firestore', async () => {
    const guestPatient = createPatient({ id: 'g1', name: 'GuestUnico' });

    await simulateInitAuth(mockUser, [], null, [guestPatient]);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('GuestUnico');

    const guestKey = localStorage.getItem('teafono_patients');
    expect(guestKey).not.toBeNull();

    const migratedFirestore = mockSavePatientToFirestore.mock.calls.find(c => c[0].id === 'g1');
    expect(migratedFirestore).toBeDefined();
  });

  it('7. recarregamento da página preserva dados após merge', async () => {
    const firestorePatient = createPatient({ id: 'f1', name: 'Persistente', createdAt: '2025-01-01T00:00:00.000Z' });
    const localPatient = createPatient({ id: 'l2', name: 'LocalPersiste', createdAt: '2025-06-01T00:00:00.000Z' });

    await simulateInitAuth(mockUser, [firestorePatient], [firestorePatient, localPatient], null);
    expect(useStore.getState().patients).toHaveLength(2);

    const storedAfter = JSON.parse(localStorage.getItem(`teafono_patients_${UID}`));
    expect(storedAfter).toHaveLength(2);

    let reloadCallCount = 0;
    mockSavePatientToFirestore.mockResolvedValue({ success: true });
    mockLoadPatientsFromFirestore.mockImplementation(() => {
      reloadCallCount++;
      if (reloadCallCount >= 2) {
        return Promise.resolve([{ ...firestorePatient }, { ...localPatient }]);
      }
      return Promise.resolve([{ ...firestorePatient }]);
    });
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      setTimeout(() => cb(mockUser), 0);
      return () => {};
    });

    await new Promise((resolve) => {
      useStore.getState().initAuth();
      setTimeout(() => resolve(), 200);
    });

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(2);
    expect(patients.find(p => p.name === 'Persistente')).toBeDefined();
    expect(patients.find(p => p.name === 'LocalPersiste')).toBeDefined();
  });

  it('8. logout e novo login com outro usuário não mistura dados', async () => {
    const userAPatient = createPatient({ id: 'u1', name: 'PacienteA' });
    await simulateInitAuth({ uid: 'user-a', displayName: 'User A' }, [userAPatient], null, null);
    expect(useStore.getState().patients).toHaveLength(1);

    useStore.getState().logout();
    await new Promise(r => setTimeout(r, 50));
    expect(useStore.getState().currentUser).toBeNull();
    expect(useStore.getState().patients).toHaveLength(0);

    mockSavePatientToFirestore.mockClear();
    mockLoadPatientsFromFirestore.mockClear();
    const userBPatient = createPatient({ id: 'u2', name: 'PacienteB' });
    mockLoadPatientsFromFirestore.mockResolvedValue([userBPatient]);
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      setTimeout(() => cb({ uid: 'user-b', displayName: 'User B' }), 0);
      return () => {};
    });

    await new Promise((resolve) => {
      useStore.getState().initAuth();
      setTimeout(() => resolve(), 200);
    });

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('PacienteB');
  });

  it('9. salvamento e reabertura da anamnese persiste no localStorage', async () => {
    useStore.getState().addPatient({ name: 'AnamneseTest', age: 4, gender: 'Feminino' });
    const pid = useStore.getState().patients[0].id;

    const form = {
      identification: { name: 'Criança', birthDate: '2020-01-01', age: '4', sex: 'Feminino' },
      mainComplaint: { firstWordsAge: '12', babbling: 'sim', comprehension: 'adequate' },
      diagnosis: { mainDiagnosis: 'Atraso de fala', affectedAreas: { speech: true } },
    };

    await useStore.getState().saveAssessmentResults('anamnese', form, null, pid);

    const stored = JSON.parse(localStorage.getItem('teafono_patients'));
    const savedAnamnese = stored.find(p => p.id === pid).history[0].results.anamnese;
    expect(savedAnamnese).toBeDefined();
    expect(savedAnamnese.identification.name).toBe('Criança');
    expect(savedAnamnese.diagnosis.mainDiagnosis).toBe('Atraso de fala');
  });

  it('10. dados mais recentes não são sobrescritos por versão antiga', async () => {
    const oldVersion = createPatient({
      id: 'v1', name: 'Versão Antiga', diagnosis: 'Antigo',
      createdAt: '2024-01-01T00:00:00.000Z',
      history: [{ id: 'h1', date: '2024-01-01', results: { mchat: { score: 2 } } }],
    });
    const newLocalVersion = createPatient({
      id: 'v1', name: 'Versão Atualizada', diagnosis: 'Atual',
      createdAt: '2025-06-01T00:00:00.000Z',
      history: [{ id: 'h1', date: '2025-06-01', results: { mchat: { score: 5 } } }],
    });

    await simulateInitAuth(mockUser, [oldVersion], [newLocalVersion], null);

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('Versão Atualizada');
    expect(patients[0].diagnosis).toBe('Atual');
    expect(patients[0].history[0].results.mchat.score).toBe(5);
  });

  it('11. localStorage do UID não é contaminado pelo guest', async () => {
    const userPatient = createPatient({ id: 'u1', name: 'MeuLocal' });

    localStorage.setItem(`teafono_patients_${UID}`, JSON.stringify([userPatient]));
    localStorage.setItem('teafono_patients', JSON.stringify([createPatient({ id: 'g1', name: 'GuestData' })]));

    mockLoadPatientsFromFirestore.mockResolvedValue([userPatient]);
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      setTimeout(() => cb(mockUser), 0);
      return () => {};
    });

    await new Promise((resolve) => {
      useStore.getState().initAuth();
      setTimeout(() => resolve(), 200);
    });

    const { patients } = useStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0].name).toBe('MeuLocal');

    expect(localStorage.getItem('teafono_patients')).not.toBeNull();
  });

  it('12. teafono_patients NUNCA é deletado pelo initAuth', async () => {
    localStorage.setItem('teafono_patients', JSON.stringify([createPatient({ id: 'g1', name: 'Preservado' })]));

    mockLoadPatientsFromFirestore.mockResolvedValue([]);
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      setTimeout(() => cb(mockUser), 0);
      return () => {};
    });

    await new Promise((resolve) => {
      useStore.getState().initAuth();
      setTimeout(() => resolve(), 200);
    });

    expect(localStorage.getItem('teafono_patients')).not.toBeNull();
  });
});
