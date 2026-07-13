import { debugLog } from './utils/debug';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc 
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let db = null;
let auth = null;

const isConfigValid = firebaseConfig.projectId && firebaseConfig.apiKey;

if (isConfigValid) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      debugLog("[Firebase] Firebase Auth e Firestore inicializados.");
    } else {
      app = getApps()[0];
      db = getFirestore(app);
      auth = getAuth(app);
    }
  } catch (err) {
    console.error("[Firebase] Falha ao inicializar:", err);
  }
} else {
  debugLog("[Firebase] Credenciais ausentes. Modo local.");
}

export function isFirebaseEnabled() {
  return db !== null && auth !== null;
}

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged };

/**
 * Remove campos undefined do objeto para evitar erros do Firestore.
 */
function removeUndefined(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefined(value);
    }
  }
  return cleaned;
}

export async function savePatientToFirestore(patient, userId) {
  if (!db || !userId) {
    console.warn('[Firestore] savePatientToFirestore: db ou userId ausente', { db: !!db, userId });
    return { success: false, error: 'Firestore não disponível' };
  }
  if (!patient?.id) {
    console.warn('[Firestore] savePatientToFirestore: patient.id ausente');
    return { success: false, error: 'patient.id ausente' };
  }
  try {
    const patientRef = doc(db, 'users', userId, 'patients', patient.id);
    const cleaned = removeUndefined(patient);
    console.log(`[DIAGNÓSTICO] 📤 ENVIANDO PARA FIRESTORE:`, {
      path: `users/${userId}/patients/${patient.id}`,
      hasHistory: !!cleaned.history,
      historyLength: cleaned.history?.length || 0,
      lastEntryResults: cleaned.history?.[0]?.results || 'VAZIO',
      anamneseKeys: Object.keys(cleaned.history?.[0]?.results?.anamnese || {}),
      cleanedSize: JSON.stringify(cleaned).length,
    });
    await setDoc(patientRef, cleaned, { merge: true });
    debugLog(`[Firestore] Paciente ${patient.name} (${patient.id}) sincronizado.`);
    return { success: true };
  } catch (err) {
    console.error("[Firestore] Erro ao sincronizar paciente:", err.code, err.message);
    return { success: false, error: err.message, code: err.code };
  }
}

export async function deletePatientFromFirestore(patientId, userId) {
  if (!db || !userId) return { success: false, error: 'Firestore não disponível' };
  try {
    await deleteDoc(doc(db, 'users', userId, 'patients', patientId));
    debugLog(`[Firestore] Paciente ${patientId} removido.`);
    return { success: true };
  } catch (err) {
    console.error("[Firestore] Erro ao deletar paciente:", err);
    return { success: false, error: err.message };
  }
}

export async function loadPatientsFromFirestore(userId) {
  if (!db || !userId) {
    console.warn('[Firestore] loadPatientsFromFirestore: db ou userId ausente');
    return [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'patients'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    const sorted = list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    console.log(`[DIAGNÓSTICO] 📖 LIDO DO FIRESTORE:`, {
      userId,
      patientCount: sorted.length,
      patients: sorted.map(p => ({
        patientId: p.id,
        patientName: p.name,
        historyLength: p.history?.length || 0,
        lastHistoryEntry: sorted[0]?.history?.[0] || null,
        lastHistoryId: sorted[0]?.history?.[0]?.id,
        lastHistoryResults: sorted[0]?.history?.[0]?.results || 'VAZIO',
        lastHistoryAnamnese: sorted[0]?.history?.[0]?.results?.anamnese || 'VAZIO',
        lastHistoryAnamneseKeys: Object.keys(sorted[0]?.history?.[0]?.results?.anamnese || {}),
      })),
    });
    debugLog(`[Firestore] ${sorted.length} pacientes carregados para usuário ${userId}.`);
    return sorted;
  } catch (err) {
    console.error("[Firestore] Erro ao carregar pacientes:", err.code, err.message);
    throw err; // Propagar para que initAuth possa tratar
  }
}
