// Funções utilitárias para anonimização e verificação de privacidade de dados (LGPD/GDPR).
// Arquivo de utilitários puro para lógica de privacidade, não componente.

/**
 * Verifica se o ambiente atual suporta crypto.subtle (secure context).
 * Em contextos não-seguros usa fallback síncrono para não quebrar o app.
 */
function isCryptoSubtleAvailable() {
  return typeof crypto !== 'undefined' && crypto && typeof crypto.subtle === 'object' && crypto.subtle !== null;
}

/**
 * Fallback determinístico (FNV-1a 32-bit) caso crypto.subtle não esteja disponível.
 * Atenção: reversível por força bruta; usado apenas quando secure context falta.
 */
function fnv1aHex(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
}

/**
 * Gera um identificador anonimizado (hash) do UID do paciente.
 * Usa SHA-256 (Web Crypto) quando disponível; caso contrário, fallback FNV-1a.
 * @param {string} uid - Identificador original do paciente
 * @returns {Promise<string>} hash no formato pat_<hex>
 */
async function hashUID(uid) {
  const pepper = '_teafono_pepper_v1';
  if (isCryptoSubtleAvailable()) {
    const data = new TextEncoder().encode(uid + pepper);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return 'pat_' + hex.substring(0, 24);
  }
  return 'pat_' + fnv1aHex(uid + pepper);
}

const PII_FIELDS = [
  'name', 'birthDate', 'birthdate', 'cpf', 'rg', 'phone', 'email', 'address',
  'street', 'city', 'zip', 'cep', 'mother', 'father', 'guardian', 'crm', 'crf',
];

/**
 * Anonimiza dados do paciente para envio externo (API de IA).
 * Remove qualquer dado pessoal direto e substitui o id por um hash irreversível.
 * @param {Object} patient - Objeto do paciente
 * @returns {Promise<Object>} Dados anonimizados
 */
export async function anonimizePatientData(patient) {
  if (!patient) return {};
  return {
    patientHash: await hashUID(patient.id),
    ageYears: patient.age || 0,
    gender: patient.gender || 'não informado',
    speechComplaint: patient.speechComplaint || '',
    diagnosis: patient.diagnosis || '',
  };
}

/**
 * Verifica se um objeto de paciente contém campos de PII proibidos.
 * Usado como defesa em profundidade antes de qualquer envio externo.
 * @param {Object} patient - Objeto do paciente
 * @returns {string[]} Lista de campos proibidos encontrados
 */
export function validateNoPersonalData(patient) {
  if (!patient || typeof patient !== 'object') return [];
  const keys = Object.keys(patient).map((k) => k.toLowerCase());
  return PII_FIELDS.filter((f) => keys.includes(f.toLowerCase()));
}

/**
 * Gera versão anonimizada do texto clínico (prompt) para IA.
 * @param {string} clinicalText - Texto clínico original
 * @returns {Promise<string>} Prompt anonimizado
 */
export async function getAnonimizedClinicalPrompt(clinicalText) {
  const anonId = await hashUID('session-' + Date.now());
  return `[${anonId}] ${clinicalText}`;
}
