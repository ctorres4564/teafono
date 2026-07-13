import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTeaPatients } from '../utils/teaEvaluations';
import {
  isFirebaseEnabled,
  savePatientToFirestore,
  deletePatientFromFirestore,
  loadPatientsFromFirestore,
  auth,
  signOut,
  onAuthStateChanged,
} from '../firebase';

const LOCAL_STORAGE_KEY = 'teafono_patients';

function getStorageKey(user) {
  return user?.uid ? `${LOCAL_STORAGE_KEY}_${user.uid}` : LOCAL_STORAGE_KEY;
}

const useStore = create(
  persist(
    (set, get) => ({
      patients: [],
      activePatientId: null,
      activeReportId: null,
      isLightMode: false,
      therapistSettings: null,
      currentUser: null,
      isGuestMode: false,
      authLoading: true,

      get activePatient() {
        const state = get();
        return state.patients.find((p) => p.id === state.activePatientId) || null;
      },

      getActivePatient: () => {
        const state = get();
        return state.patients.find((p) => p.id === state.activePatientId) || null;
      },

      loadFromLocalStorage: () => {
        const storedSettings = localStorage.getItem('teafono_therapist_settings');
        if (storedSettings) {
          set({ therapistSettings: JSON.parse(storedSettings) });
        }
        const storedTheme = localStorage.getItem('teafono_theme');
        if (storedTheme === 'light') {
          set({ isLightMode: true });
          document.body.classList.add('light-mode');
        }
      },

      toggleTheme: () => {
        const next = !get().isLightMode;
        set({ isLightMode: next });
        if (next) {
          document.body.classList.add('light-mode');
          localStorage.setItem('teafono_theme', 'light');
        } else {
          document.body.classList.remove('light-mode');
          localStorage.setItem('teafono_theme', 'dark');
        }
      },

      persistPatients: (updatedList) => {
        set({ patients: updatedList });
        const { currentUser } = get();
        const key = getStorageKey(currentUser);
        try {
          const data = JSON.stringify(updatedList);
          localStorage.setItem(key, data);
          console.log(`[persistPatients] Dados salvos em localStorage (chave: ${key}) - ${updatedList.length} pacientes (${data.length} bytes)`);
          localStorage.setItem(key + '_backup', data);
        } catch (e) {
          console.error('[persistPatients] Erro ao salvar no localStorage:', e);
        }
      },

      syncPatientsToFirestore: async (patientList) => {
        const { currentUser } = get();
        if (!currentUser || !isFirebaseEnabled()) return { success: false, error: 'Firestore não disponível' };
        const results = [];
        for (const patient of patientList) {
          try {
            const result = await savePatientToFirestore(patient, currentUser.uid);
            results.push({ id: patient.id, ...result });
            if (!result.success) {
              console.error(`[syncPatientsToFirestore] Falha ao salvar ${patient.id}: ${result.error}`);
            }
          } catch (err) {
            console.error(`[syncPatientsToFirestore] Erro inesperado ao salvar ${patient.id}:`, err);
            results.push({ id: patient.id, success: false, error: err.message });
          }
        }
        const ok = results.filter(r => r.success).length;
        const fail = results.filter(r => !r.success).length;
        if (fail > 0) {
          console.warn(`[syncPatientsToFirestore] ${ok} ok, ${fail} falha(s)`);
        } else {
          console.log(`[syncPatientsToFirestore] ${ok} paciente(s) sincronizado(s)`);
        }
        return { results, success: fail === 0 };
      },

      loadAndVerifyFirestore: async () => {
        const { currentUser } = get();
        if (!currentUser || !isFirebaseEnabled()) return null;
        try {
          const fresh = await loadPatientsFromFirestore(currentUser.uid);
          console.log(`[loadAndVerifyFirestore] ${fresh.length} pacientes lidos do Firestore pós-sincronização`);
          return fresh;
        } catch (err) {
          console.error('[loadAndVerifyFirestore] Erro ao reler Firestore:', err);
          return null;
        }
      },

      selectPatient: (patient) => {
        const updated = get().patients.map((p) => ({
          ...p,
          isSelected: p.id === patient.id,
        }));
        set({ activePatientId: patient.id });
        get().persistPatients(updated);
      },

      addPatient: (newPatData) => {
        const newPat = {
          id: 'tp_' + Date.now(),
          name: newPatData.name,
          age: newPatData.age,
          gender: newPatData.gender,
          diagnosis: newPatData.diagnosis || '',
          birthDate: newPatData.birthDate || '',
          speechComplaint: newPatData.speechComplaint || '',
          createdAt: new Date().toISOString(),
          history: [],
          isSelected: true,
        };
        const updated = [newPat, ...get().patients.map((p) => ({ ...p, isSelected: false }))];
        set({ activePatientId: newPat.id });
        get().persistPatients(updated);
      },

      deletePatient: (id) => {
        if (!window.confirm('Deseja realmente remover esta ficha e todo o histórico clínico desta criança?')) return;
        const updated = get().patients.filter((p) => p.id !== id);
        const { activePatientId, currentUser } = get();
        if (activePatientId === id) {
          set({ activePatientId: null });
        }
        get().persistPatients(updated);
        if (isFirebaseEnabled() && currentUser) {
          deletePatientFromFirestore(id, currentUser.uid);
        }
      },

      updatePatient: (updatedPatData) => {
        const updated = get().patients.map((p) => {
          if (p.id === updatedPatData.id) {
            return {
              ...p,
              name: updatedPatData.name ?? p.name,
              age: updatedPatData.age ?? p.age,
              gender: updatedPatData.gender ?? p.gender,
              diagnosis: updatedPatData.diagnosis ?? p.diagnosis,
              birthDate: updatedPatData.birthDate ?? p.birthDate,
              speechComplaint: updatedPatData.speechComplaint ?? p.speechComplaint,
            };
          }
          return p;
        });
        get().persistPatients(updated);
      },

      importBackupList: (importedList) => {
        if (!Array.isArray(importedList)) return;
        if (
          !window.confirm(
            `Você está prestes a importar ${importedList.length} fichas de pacientes. Isso substituirá as fichas locais atuais. Deseja continuar?`
          )
        ) return;
        const resetList = importedList.map((p, idx) => ({
          ...p,
          history: Array.isArray(p.history) ? p.history : [],
          isSelected: idx === 0,
        }));
        set({ activePatientId: resetList.length > 0 ? resetList[0].id : null });
        get().persistPatients(resetList);
      },

      saveAssessmentResults: async (moduleName, results, entryId, patientId) => {
        const { patients, activePatientId } = get();
        const pid = patientId || activePatientId;
        console.log(`[saveAssessmentResults] iniciando: moduleName=${moduleName}, pid=${pid}, entryId=${entryId}, patients.length=${patients.length}`);
        if (!pid) { console.error('[saveAssessmentResults] Nenhum patientId disponível'); return { success: false, error: 'Nenhum patientId' }; }
        const patientIdx = patients.findIndex((p) => p.id === pid);
        if (patientIdx === -1) { console.error('[saveAssessmentResults] Paciente não encontrado:', pid); return { success: false, error: 'Paciente não encontrado' }; }

        let patientCopy;
        try {
          patientCopy = JSON.parse(JSON.stringify(patients[patientIdx]));
        } catch (e) {
          console.error('[saveAssessmentResults] Erro ao clonar paciente:', e);
          patientCopy = { ...patients[patientIdx], history: [...(patients[patientIdx].history || [])] };
        }
        if (!Array.isArray(patientCopy.history)) {
          patientCopy.history = [];
        }

        let resultsCopy;
        try {
          resultsCopy = JSON.parse(JSON.stringify(results));
        } catch (e) {
          console.error('[saveAssessmentResults] Erro ao clonar results:', e);
          resultsCopy = { ...results };
        }

        if (entryId) {
          const existingIdx = patientCopy.history.findIndex((h) => h.id === entryId);
          if (existingIdx !== -1) {
            patientCopy.history[existingIdx] = {
              ...patientCopy.history[existingIdx],
              date: new Date().toISOString(),
              results: { ...patientCopy.history[existingIdx].results, [moduleName]: resultsCopy },
            };
          } else {
            patientCopy.history.unshift({
              id: entryId,
              date: new Date().toISOString(),
              results: { [moduleName]: resultsCopy },
            });
          }
        } else {
          patientCopy.history.unshift({
            id: 'teval_' + Date.now(),
            date: new Date().toISOString(),
            results: { [moduleName]: resultsCopy },
          });
        }

        const updatedPatients = [...patients];
        updatedPatients[patientIdx] = patientCopy;
        const evalId = patientCopy.history[0].id;

        set({ patients: updatedPatients, activePatientId: pid, activeReportId: evalId });

        get().persistPatients(updatedPatients);

        const key = getStorageKey(get().currentUser);
        const savedRaw = localStorage.getItem(key);
        let savedOk = false;
        if (savedRaw) {
          try {
            const savedParsed = JSON.parse(savedRaw);
            const savedPat = savedParsed.find((p) => p.id === pid);
            if (savedPat && Array.isArray(savedPat.history) && savedPat.history.some((h) => h.id === evalId)) {
              savedOk = true;
            }
          } catch (parseErr) {
            console.error('[saveAssessmentResults] Erro ao verificar localStorage:', parseErr);
          }
        }
        console.log(`[saveAssessmentResults] ${moduleName} salvo para paciente ${pid} (entry: ${evalId}) - localStorage verificado: ${savedOk}`);

        const firestoreResult = await get().syncPatientsToFirestore([patientCopy]);
        if (firestoreResult.success) {
          console.log(`[saveAssessmentResults] Firestore confirmado para ${pid}`);
          return { success: true, entryId: evalId };
        } else {
          console.error(`[saveAssessmentResults] Firestore FALHOU para ${pid}`);
          return { success: false, error: 'Falha ao salvar no Firestore', entryId: evalId };
        }
      },

      viewReport: (reportId) => {
        set({ activeReportId: reportId });
      },

      saveTherapistSettings: (settings) => {
        set({ therapistSettings: settings });
        localStorage.setItem('teafono_therapist_settings', JSON.stringify(settings));
      },

      logout: async () => {
        if (isFirebaseEnabled()) {
          try {
            await signOut(auth);
          } catch (err) {
            console.error('Erro ao deslogar:', err);
          }
        }
        set({
          isGuestMode: false,
          currentUser: null,
          patients: [],
          activePatientId: null,
        });
      },

      initAuth: () => {
        if (!isFirebaseEnabled()) {
          console.log('[initAuth] Firebase desabilitado. Mantendo dados locais.');
          set({ authLoading: false });
          return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          set({ authLoading: true });
          if (user) {
            set({ currentUser: user, isGuestMode: false });
            console.log('[initAuth] Usuário autenticado:', user.uid);

            let firestoreList = [];
            let firestoreError = false;
            try {
              firestoreList = await loadPatientsFromFirestore(user.uid);
            } catch (err) {
              console.error('[initAuth] Erro ao carregar do Firestore:', err);
              firestoreError = true;
            }

            const userKey = getStorageKey(user);
            let userLocalRaw = localStorage.getItem(userKey);
            if (!userLocalRaw) {
              userLocalRaw = localStorage.getItem(userKey + '_backup');
              if (userLocalRaw) console.log('[initAuth] Usando backup do localStorage (logado)');
            }
            let guestLocalRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!guestLocalRaw) {
              guestLocalRaw = localStorage.getItem(LOCAL_STORAGE_KEY + '_backup');
            }

            if (firestoreList && firestoreList.length > 0) {
              let merged = [...firestoreList];
              if (userLocalRaw) {
                try {
                  const localParsed = JSON.parse(userLocalRaw);
                  if (Array.isArray(localParsed) && localParsed.length > 0) {
                    merged = firestoreList.map((fPat) => {
                      const localPat = localParsed.find((l) => l.id === fPat.id);
                      if (localPat) {
                        const fTime = new Date(fPat.createdAt || 0).getTime();
                        const lTime = new Date(localPat.createdAt || 0).getTime();
                        if (lTime >= fTime && localPat.history?.length >= (fPat.history?.length || 0)) {
                          return JSON.parse(JSON.stringify(localPat));
                        }
                      }
                      return fPat;
                    });
                    const localsToSync = [];
                    localParsed.forEach((lPat) => {
                      if (!merged.find((m) => m.id === lPat.id)) {
                        merged.push(JSON.parse(JSON.stringify(lPat)));
                        localsToSync.push(lPat);
                      }
                    });
                    if (localsToSync.length > 0) {
                      console.log(`[initAuth] Sincronizando ${localsToSync.length} paciente(s) locais com o Firestore`);
                      const syncResult = await get().syncPatientsToFirestore(localsToSync);
                      if (syncResult.success) {
                        const freshFromFirestore = await get().loadAndVerifyFirestore();
                        if (freshFromFirestore && freshFromFirestore.length > 0) {
                          merged = [...freshFromFirestore];
                          console.log(`[initAuth] Após sync, Firestore tem ${freshFromFirestore.length} pacientes — estado atualizado via Firestore`);
                        }
                      } else {
                        console.warn('[initAuth] Sync parcial/falha — mantendo merge local com pacientes sincronizados');
                      }
                    }
                  }
                } catch (e) { console.error('[initAuth] Erro ao fazer merge:', e); }
              }
              set({ patients: merged });
              localStorage.setItem(userKey, JSON.stringify(merged));
              console.log(`[initAuth] ${merged.length} pacientes carregados (Firestore + merge local)`);
              const selected = merged.find((p) => p.isSelected);
              if (selected) set({ activePatientId: selected.id });
            } else if (firestoreError) {
              const fallbackRaw = userLocalRaw || guestLocalRaw;
              if (fallbackRaw) {
                try {
                  const parsed = JSON.parse(fallbackRaw);
                  if (Array.isArray(parsed)) {
                    set({ patients: parsed });
                    localStorage.setItem(userKey, JSON.stringify(parsed));
                    const selected = parsed.find((p) => p.isSelected);
                    if (selected) set({ activePatientId: selected.id });
                    console.log(`[initAuth] Fallback para dados locais: ${parsed.length} pacientes`);
                  }
                } catch (e) {
                  console.error('[initAuth] Erro ao ler fallback local:', e);
                  set({ patients: [] });
                }
              } else {
                set({ patients: [] });
              }
            } else {
              const localSource = userLocalRaw || guestLocalRaw || null;
              if (localSource) {
                try {
                  const parsed = JSON.parse(localSource);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    set({ patients: parsed });
                    localStorage.setItem(userKey, JSON.stringify(parsed));
                    const isGuestSource = !userLocalRaw && !!guestLocalRaw;
                    const syncResult = await get().syncPatientsToFirestore(parsed);
                    if (syncResult.success) {
                      const freshFromFirestore = await get().loadAndVerifyFirestore();
                      if (freshFromFirestore && freshFromFirestore.length > 0) {
                        set({ patients: freshFromFirestore });
                        localStorage.setItem(userKey, JSON.stringify(freshFromFirestore));
                        console.log(`[initAuth] Após sync, Firestore tem ${freshFromFirestore.length} pacientes`);
                      }
                    } else {
                      console.warn('[initAuth] Sync para nuvem teve falhas — dados mantidos localmente');
                    }
                    if (isGuestSource) {
                      console.log(`[initAuth] Dados migrados do modo convidado para nuvem: ${parsed.length} pacientes`);
                    } else {
                      console.log(`[initAuth] Dados locais sincronizados para nuvem: ${parsed.length} pacientes`);
                    }
                    const selected = parsed.find((p) => p.isSelected);
                    if (selected) set({ activePatientId: selected.id });
                  } else {
                    set({ patients: [] });
                  }
                } catch (e) {
                  console.error('[initAuth] Erro ao processar dados locais:', e);
                  set({ patients: [] });
                }
              } else {
                console.log('[initAuth] Nenhum dado encontrado. Iniciando vazio.');
                set({ patients: [] });
              }
            }
          } else {
            set({ currentUser: null });
            const { isGuestMode } = get();
            if (!isGuestMode) {
              let localData = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (!localData) {
                localData = localStorage.getItem(LOCAL_STORAGE_KEY + '_backup');
                if (localData) console.log('[initAuth] Usando backup do localStorage (não-logado)');
              }
              if (localData) {
                try {
                  const parsed = JSON.parse(localData);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    set({ patients: parsed });
                    const selected = parsed.find((p) => p.isSelected);
                    if (selected) set({ activePatientId: selected.id });
                    console.log(`[initAuth] Modo não-logado: ${parsed.length} pacientes do localStorage`);
                    set({ authLoading: false });
                    return;
                  }
                } catch (_) { /* ignore */ }
              }
              set({ patients: [], activePatientId: null });
            }
          }
          set({ authLoading: false });
        });
        return unsubscribe;
      },

      initGuestMode: () => {
        const key = getStorageKey(null);
        let stored = localStorage.getItem(key);
        if (!stored) {
          stored = localStorage.getItem(key + '_backup');
          if (stored) console.log('[initGuestMode] Usando backup do localStorage');
        }
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              set({ patients: parsed });
              const selected = parsed.find((p) => p.isSelected);
              if (selected) set({ activePatientId: selected.id });
              console.log(`[initGuestMode] Carregados ${parsed.length} pacientes de localStorage`);
              return;
            }
          } catch (e) { console.error('[initGuestMode] Erro ao ler dados:', e); }
        }
        localStorage.setItem(key, JSON.stringify(mockTeaPatients));
        set({ patients: mockTeaPatients, activePatientId: mockTeaPatients[0].id });
        console.log('[initGuestMode] Dados mock carregados');
      },

      setGuestMode: (val) => {
        set({ isGuestMode: val });
      },

      setActiveReportId: (val) => {
        set({ activeReportId: val });
      },
    }),
    {
      name: 'teafono-store',
      partialize: (state) => ({
        isLightMode: state.isLightMode,
        isGuestMode: state.isGuestMode,
        patients: state.patients,
      }),
    }
  )
);

export default useStore;
