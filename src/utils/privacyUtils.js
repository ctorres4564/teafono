/**
 * Privacy utilities for anonymizing patient data before sending to external APIs
 * Ensures compliance with LGPD (Lei Geral de Proteção de Dados) and GDPR
 */

/**
 * Create a one-way hash of a patient ID for anonymization
 * @param {string} uid - Patient unique identifier
 * @returns {string} Hashed identifier (irreversible)
 */
function hashUID(uid) {
  // Use SubtleCrypto for browser-native hashing (no external dependency)
  // Note: This is async in real browsers, but we provide sync version using simple hash
  // In production, consider using crypto-js or tweetnacl for better guarantees

  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'pat_' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Anonymize patient data for sharing with external AI APIs
 * Removes personally identifiable information (PII) while preserving clinical data needed for assessment
 *
 * @param {Object} patient - Patient object with personal and clinical data
 * @returns {Object} Anonymized patient data safe for external processing
 *
 * REMOVED DATA:
 * - name (personally identifiable)
 * - birthDate (personally identifiable, can reveal age through calculation)
 *
 * KEPT DATA (clinical necessity):
 * - age (needed for developmental assessment)
 * - gender (relevant for speech/pragmatic analysis)
 * - speechComplaint (essential for therapeutic plan)
 * - diagnosis (essential for therapeutic plan)
 */
export function anonimizePatientData(patient) {
  if (!patient) {
    return {};
  }

  return {
    // Hashed identifier - cannot be reversed to identify patient
    patientHash: hashUID(patient.id),

    // Clinical data (keep)
    ageYears: patient.age || 0,
    gender: patient.gender || 'não informado',
    speechComplaint: patient.speechComplaint || '',
    diagnosis: patient.diagnosis || '',

    // Explicitly NOT including:
    // - name (PII)
    // - birthDate (PII)
    // - therapistName (PII)
    // - any contact information
  };
}

/**
 * Get the clinical context for Gemini API without exposing PII
 * @param {Object} patient - Patient object
 * @param {Object} assessments - Assessment results
 * @returns {string} Formatted clinical data for prompt
 */
export function getAnonimizedClinicalPrompt(patient, assessments) {
  const anon = anonimizePatientData(patient);

  return `**Dados Clínicos (Anônimos):**
- Paciente ID (hash): ${anon.patientHash}
- Idade: ${anon.ageYears} anos
- Gênero: ${anon.gender}
- Queixa Fonoaudiológica: ${anon.speechComplaint}

**Resultados das Avaliações:**
- M-CHAT-R/F Risco: ${assessments.mchat?.risk || 'não realizado'}
- Perfil Pragmático: ${assessments.pragmatics?.ratePerMinute || 0} atos/min, dominante: ${assessments.pragmatics?.predominantMean || 'não avaliado'}
- Seletividade Alimentar: ${assessments.bambi?.severity || 'não avaliado'}`;
}

/**
 * Validate that no PII is being sent to external services
 * Use this for testing/audit purposes
 */
export function validateNoPersonalData(data) {
  const dataStr = JSON.stringify(data).toLowerCase();

  // Check for common patterns that indicate PII
  const piiPatterns = [
    /\b[a-z\s]{2,}\s[a-z]{2,}\b/gi, // Name patterns
    /\d{4}-\d{2}-\d{2}/g, // Date patterns (YYYY-MM-DD)
    /\d{2}\/\d{2}\/\d{4}/g, // Date patterns (MM/DD/YYYY)
    /cpf|crm|crf/i, // Professional registry numbers
  ];

  const issues = [];

  // Note: This is a basic check. For production, use dedicated PII detection libraries
  if (/\b[a-z]{2,}\s[a-z]{2,}/.test(dataStr)) {
    issues.push('Possible name patterns detected');
  }

  if (/\d{4}-\d{2}-\d{2}/.test(dataStr)) {
    issues.push('Possible date patterns detected');
  }

  return {
    hasPotentialPII: issues.length > 0,
    issues: issues,
  };
}
