import { describe, it, expect, vi } from 'vitest';
import { isLocalNewer, getLocalsToSync, stripDemoPatients, mergePatients } from './mergePatients';

function makePatient(overrides = {}) {
  return {
    id: 'p1',
    name: 'Teste',
    createdAt: '2025-01-01T00:00:00.000Z',
    history: [],
    ...overrides,
  };
}

describe('isLocalNewer', () => {
  it('retorna true quando local é mais recente', () => {
    const firestore = makePatient({ createdAt: '2025-01-01T00:00:00.000Z' });
    const local = makePatient({ createdAt: '2025-06-01T00:00:00.000Z' });
    expect(isLocalNewer(firestore, local)).toBe(true);
  });

  it('retorna true quando mesma data e history igual', () => {
    const firestore = makePatient({ createdAt: '2025-01-01T00:00:00.000Z', history: [{ id: 'h1' }] });
    const local = makePatient({ createdAt: '2025-01-01T00:00:00.000Z', history: [{ id: 'h1' }] });
    expect(isLocalNewer(firestore, local)).toBe(true);
  });

  it('retorna false quando firestore é mais recente', () => {
    const firestore = makePatient({ createdAt: '2025-06-01T00:00:00.000Z' });
    const local = makePatient({ createdAt: '2025-01-01T00:00:00.000Z' });
    expect(isLocalNewer(firestore, local)).toBe(false);
  });

  it('retorna false quando local tem menos history', () => {
    const firestore = makePatient({ createdAt: '2025-06-01T00:00:00.000Z', history: [{ id: 'h1' }, { id: 'h2' }] });
    const local = makePatient({ createdAt: '2025-06-01T00:00:00.000Z', history: [] });
    expect(isLocalNewer(firestore, local)).toBe(false);
  });

  it('usa 0 como fallback para createdAt inválido', () => {
    const firestore = makePatient({ createdAt: null });
    const local = makePatient({ createdAt: '2025-01-01T00:00:00.000Z' });
    expect(isLocalNewer(firestore, local)).toBe(true);
  });
});

describe('getLocalsToSync', () => {
  it('retorna apenas pacientes locais ausentes no merged', () => {
    const merged = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    const localParsed = [
      { id: 'a', name: 'A' },
      { id: 'c', name: 'C' },
    ];
    expect(getLocalsToSync(localParsed, merged)).toHaveLength(1);
    expect(getLocalsToSync(localParsed, merged)[0].id).toBe('c');
  });

  it('retorna vazio quando todos já estão no merged', () => {
    const merged = [{ id: 'a' }, { id: 'b' }];
    const localParsed = [{ id: 'a' }, { id: 'b' }];
    expect(getLocalsToSync(localParsed, merged)).toHaveLength(0);
  });
});

describe('stripDemoPatients', () => {
  it('remove pacientes marcados como isDemo', () => {
    const list = [{ id: 'tp1', isDemo: true }, { id: 'r1' }];
    expect(stripDemoPatients(list)).toEqual([{ id: 'r1' }]);
  });
});

describe('mergePatients', () => {
  it('retorna firestoreList quando não há dados locais', async () => {
    const result = await mergePatients({
      firestoreList: [makePatient({ id: 'f1' })],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: null,
      syncPatientsToFirestore: vi.fn(),
      loadAndVerifyFirestore: vi.fn(),
    });
    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].id).toBe('f1');
  });

  it('faz merge de dados locais com firestore', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn().mockResolvedValue([
      makePatient({ id: 'f1', name: 'Firestore' }),
      makePatient({ id: 'l1', name: 'Local' }),
    ]);

    const result = await mergePatients({
      firestoreList: [makePatient({ id: 'f1', name: 'Firestore' })],
      firestoreError: false,
      userLocalRaw: JSON.stringify([makePatient({ id: 'l1', name: 'Local' })]),
      guestLocalRaw: null,
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toHaveLength(2);
    expect(result.patients.find(p => p.id === 'l1').name).toBe('Local');
    expect(syncMock).toHaveBeenCalledWith([expect.objectContaining({ id: 'l1' })]);
  });

  it('fallback para dados locais quando firestoreError', async () => {
    const result = await mergePatients({
      firestoreList: [],
      firestoreError: true,
      userLocalRaw: JSON.stringify([makePatient({ id: 'f1', name: 'Fallback' })]),
      guestLocalRaw: null,
      syncPatientsToFirestore: vi.fn(),
      loadAndVerifyFirestore: vi.fn(),
    });
    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].name).toBe('Fallback');
  });

  it('migra dados do guest quando firestore vazio', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn().mockResolvedValue([makePatient({ id: 'g1', name: 'Migrado' })]);

    const result = await mergePatients({
      firestoreList: [],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: JSON.stringify([makePatient({ id: 'g1', name: 'Migrado' })]),
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].name).toBe('Migrado');
    expect(result.isGuestMigration).toBe(true);
    expect(result.migratedCount).toBe(1);
    expect(syncMock).toHaveBeenCalled();
  });

  it('NÃO migra pacientes de demonstração (isDemo) do guest para a nuvem', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn();

    const result = await mergePatients({
      firestoreList: [],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: JSON.stringify([
        makePatient({ id: 'tp1', name: 'Arthur de Almeida Rezende', isDemo: true }),
        makePatient({ id: 'tp2', name: 'Laura Viana Mendes', isDemo: true }),
      ]),
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toEqual([]);
    expect(syncMock).not.toHaveBeenCalled();
    expect(loadMock).not.toHaveBeenCalled();
  });

  it('migra apenas pacientes reais do guest, ignorando os de demonstração misturados', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn().mockResolvedValue([makePatient({ id: 'real1', name: 'Real' })]);

    const result = await mergePatients({
      firestoreList: [],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: JSON.stringify([
        makePatient({ id: 'tp1', name: 'Demo', isDemo: true }),
        makePatient({ id: 'real1', name: 'Real' }),
      ]),
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].name).toBe('Real');
    expect(syncMock).toHaveBeenCalledWith([expect.objectContaining({ id: 'real1' })]);
  });

  it('não sincroniza pacientes de demonstração do guest quando já existem dados no Firestore', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn();

    const result = await mergePatients({
      firestoreList: [makePatient({ id: 'f1', name: 'ContaReal' })],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: JSON.stringify([makePatient({ id: 'tp1', name: 'Demo', isDemo: true })]),
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].name).toBe('ContaReal');
    expect(syncMock).not.toHaveBeenCalled();
  });

  it('retorna lista vazia quando não há dados', async () => {
    const result = await mergePatients({
      firestoreList: [],
      firestoreError: false,
      userLocalRaw: null,
      guestLocalRaw: null,
      syncPatientsToFirestore: vi.fn(),
      loadAndVerifyFirestore: vi.fn(),
    });
    expect(result.patients).toEqual([]);
  });

  it('preserva dados locais quando sync falha e re-verify é vazio', async () => {
    const syncMock = vi.fn().mockResolvedValue({ success: true });
    const loadMock = vi.fn().mockResolvedValue([]);

    const result = await mergePatients({
      firestoreList: [],
      firestoreError: false,
      userLocalRaw: JSON.stringify([makePatient({ id: 'l1', name: 'LocalKeep' })]),
      guestLocalRaw: null,
      syncPatientsToFirestore: syncMock,
      loadAndVerifyFirestore: loadMock,
    });

    expect(result.patients).toHaveLength(1);
    expect(result.patients[0].name).toBe('LocalKeep');
    expect(result.isGuestMigration).toBe(false);
  });
});
