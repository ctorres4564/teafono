import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc } from 'firebase/firestore';

const args = process.argv.slice(2);
const uidArg = args.find((arg) => arg.startsWith('--uid='));
const shouldWrite = args.includes('--write');
const uid = uidArg?.split('=')[1];

if (!uid) {
  console.error('Uso: node scripts/migrate-root-patients.mjs --uid=<UID_DO_USUARIO> [--write]');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Defina VITE_FIREBASE_API_KEY e VITE_FIREBASE_PROJECT_ID no ambiente antes de rodar a migração.');
  process.exit(1);
}

const normalizePatient = (patient, fallbackId) => ({
  ...patient,
  id: patient.id || fallbackId,
  name: patient.name || '',
  history: Array.isArray(patient.history) ? patient.history : [],
  anamnesis: patient.anamnesis || {},
  updatedAt: new Date().toISOString(),
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const snapshot = await getDocs(collection(db, 'patients'));
const operations = [];

snapshot.forEach((patientDoc) => {
  const patient = normalizePatient(patientDoc.data(), patientDoc.id);
  operations.push({
    source: `patients/${patientDoc.id}`,
    target: `users/${uid}/patients/${patient.id}`,
    patient,
  });
});

console.table(operations.map((operation) => ({
  source: operation.source,
  target: operation.target,
  id: operation.patient.id,
  name: operation.patient.name,
})));

if (!shouldWrite) {
  console.log(`Dry-run concluído: ${operations.length} paciente(s) seriam copiados. Use --write para gravar.`);
  process.exit(0);
}

for (const operation of operations) {
  await setDoc(doc(db, 'users', uid, 'patients', operation.patient.id), operation.patient, { merge: true });
}

console.log(`Migração concluída: ${operations.length} paciente(s) copiados para users/${uid}/patients.`);
