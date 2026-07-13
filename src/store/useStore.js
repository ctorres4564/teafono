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

const normalizePatient = (patient) => ({
  ...patient,
  history: Array.isArray(patient.history) ? patient.history : [],
});

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
        const storedGuestMode = localStorage.getItem('teafono_guest_mode');
        if (storedGuestMode === 'true') {
          set({ isGuestMode: true });
        }
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
        const sanitizedList = updatedList.map(normalizePatient);
        set({ patients: sanitizedList });
        const { currentUser } = get();
        if (currentUser) {
          localStorage.setItem(
            `teafono_patients_${currentUser.uid}`,
            JSON.stringify(sanitizedList)
          );
          if (isFirebaseEnabled()) {
            sanitizedList.forEach((patient) => {
              savePatientToFirestore(patient, currentUser.uid);
            });
          }
        } else {
          localStorage.setItem('teafono_patients', JSON.stringify(sanitizedList));
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
          name: newPatData.name?.trim(),
          age: newPatData.age,
          gender: newPatData.gender,
          diagnosis: newPatData.diagnosis?.trim() || '',
          birthDate: newPatData.birthDate || '',
          speechComplaint: newPatData.speechComplaint?.trim() || '',
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
              ...updatedPatData,
              name: updatedPatData.name?.trim(),
              age: updatedPatData.age,
              diagnosis: updatedPatData.diagnosis?.trim() || '',
              birthDate: updatedPatData.birthDate || '',
              speechComplaint: updatedPatData.speechComplaint?.trim() || '',
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
          isSelected: idx === 0,
        }));
        set({ activePatientId: resetList.length > 0 ? resetList[0].id : null });
        get().persistPatients(resetList);
      },

      saveAssessmentResults: (moduleName, results) => {
        const { patients, activePatient } = get();
        if (!activePatient) return;
        const patientIdx = patients.findIndex((p) => p.id === activePatient.id);
        if (patientIdx === -1) return;

        const patientCopy = { ...patients[patientIdx] };
        const evalId = 'teval_' + Date.now();
        const newHistoryEntry = {
          id: evalId,
          date: new Date().toISOString(),
          results: { [moduleName]: results },
        };
        patientCopy.history = [newHistoryEntry, ...(patientCopy.history || [])];
        const updatedPatients = [...patients];
        updatedPatients[patientIdx] = patientCopy;
        set({ patients: updatedPatients, activeReportId: evalId });
        get().persistPatients(updatedPatients);
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
        localStorage.setItem('teafono_guest_mode', JSON.stringify(false));
        set({
          isGuestMode: false,
          currentUser: null,
          patients: [],
          activePatientId: null,
        });
      },

      initAuth: () => {
        if (!isFirebaseEnabled()) {
          set({ authLoading: false });
          return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          set({ authLoading: true });
          if (user) {
            set({ currentUser: user, isGuestMode: false });
            const firestoreList = await loadPatientsFromFirestore(user.uid);
            if (firestoreList && firestoreList.length > 0) {
              const normalizedList = firestoreList.map(normalizePatient);
              set({ patients: normalizedList });
              localStorage.setItem(`teafono_patients_${user.uid}`, JSON.stringify(normalizedList));
              const selected = normalizedList.find((p) => p.isSelected) || normalizedList[0];
              if (selected) set({ activePatientId: selected.id });
            } else {
              const userStored = localStorage.getItem(`teafono_patients_${user.uid}`);
              if (userStored) {
                const normalizedList = JSON.parse(userStored).map(normalizePatient);
                set({ patients: normalizedList });
                const selected = normalizedList.find((p) => p.isSelected) || normalizedList[0];
                if (selected) set({ activePatientId: selected.id });
              } else {
                const localStored = localStorage.getItem('teafono_patients');
                if (localStored) {
                  const parsed = JSON.parse(localStored);
                  if (
                    parsed.length > 0 &&
                    window.confirm(
                      'Detectamos fichas de pacientes criadas localmente neste navegador. Deseja sincronizá-las e salvá-las na sua conta em nuvem?'
                    )
                  ) {
                    const normalizedList = parsed.map(normalizePatient);
                    set({ patients: normalizedList });
                    localStorage.setItem(`teafono_patients_${user.uid}`, JSON.stringify(normalizedList));
                    normalizedList.forEach((pat) => {
                      savePatientToFirestore(pat, user.uid);
                    });
                    localStorage.removeItem('teafono_patients');
                  } else {
                    set({ patients: [], activePatientId: null });
                  }
                } else {
                  set({ patients: [], activePatientId: null });
                }
              }
            }
          } else {
            set({ currentUser: null });
            const { isGuestMode } = get();
            if (!isGuestMode) {
              set({ patients: [], activePatientId: null });
            }
          }
          set({ authLoading: false });
        });
        return unsubscribe;
      },

      initGuestMode: () => {
        const stored = localStorage.getItem('teafono_patients');
        if (stored) {
          const parsed = JSON.parse(stored);
          const normalizedList = parsed.map(normalizePatient);
          set({ patients: normalizedList });
          const selected = normalizedList.find((p) => p.isSelected) || normalizedList[0];
          if (selected) set({ activePatientId: selected.id });
        } else {
          localStorage.setItem('teafono_patients', JSON.stringify(mockTeaPatients));
          set({ patients: mockTeaPatients, activePatientId: mockTeaPatients[0].id });
        }
      },

      setGuestMode: (val) => {
        set({ isGuestMode: val });
        localStorage.setItem('teafono_guest_mode', JSON.stringify(val));
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
        activePatientId: state.activePatientId,
      }),
    }
  )
);

export default useStore;
