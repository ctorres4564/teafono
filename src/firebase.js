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

// Lê chaves do Vite env (.env) ou usa as credenciais padrão do seu projeto do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDK5T3chBAm2q4V4MzLYW1rJ28NRjn4k2Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teafono-b4ef8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teafono-b4ef8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teafono-b4ef8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12884130779",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12884130779:web:4a860183e31671c7a585fe"
};

let app = null;
let db = null;
let auth = null;

// Inicialização segura do Firebase (Modo Híbrido)
const isConfigValid = firebaseConfig.projectId && firebaseConfig.apiKey;

if (isConfigValid) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      console.log("Google Firebase Auth e Firestore inicializados em nuvem.");
    } else {
      app = getApps()[0];
      db = getFirestore(app);
      auth = getAuth(app);
    }
  } catch (err) {
    console.error("Falha ao inicializar o Firebase. Rodando no modo local.", err);
  }
} else {
  console.log("Credenciais do Firebase ausentes no arquivo .env. Rodando no modo LocalStorage híbrido.");
}

/**
 * Retorna se o Firebase está ativo no momento
 */
export function isFirebaseEnabled() {
  return db !== null && auth !== null;
}

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged };

/**
 * Salva ou atualiza um paciente individual no Firestore sob o UID do usuário
 */
export async function savePatientToFirestore(patient, userId) {
  if (!db || !userId) return;
  try {
    const patientRef = doc(db, 'users', userId, 'patients', patient.id);
    await setDoc(patientRef, patient, { merge: true });
    console.log(`Paciente ${patient.name} (${patient.id}) sincronizado na nuvem para o usuário ${userId}.`);
  } catch (err) {
    console.error("Erro ao sincronizar paciente no Firestore:", err);
  }
}

/**
 * Remove um paciente do Firestore pelo ID sob o UID do usuário
 */
export async function deletePatientFromFirestore(patientId, userId) {
  if (!db || !userId) return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'patients', patientId));
    console.log(`Paciente ${patientId} removido da nuvem para o usuário ${userId}.`);
  } catch (err) {
    console.error("Erro ao deletar paciente do Firestore:", err);
  }
}

/**
 * Carrega a lista completa de pacientes do Firestore sob o UID do usuário
 */
export async function loadPatientsFromFirestore(userId) {
  if (!db || !userId) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'patients'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    // Ordena pela data de criação decrescente
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.error("Erro ao carregar pacientes do Firestore. Fallback local.", err);
    return [];
  }
}
