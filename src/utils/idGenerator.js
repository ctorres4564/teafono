/**
 * Secure ID generation utilities
 * Replaces predictable Date.now() with cryptographically secure UUIDs
 * Prevents ID enumeration attacks (OWASP A04:2021 - Insecure Direct Object Reference)
 */

/**
 * Generate a cryptographically secure patient ID
 * @returns {string} Unique patient identifier with 'tp_' prefix
 */
export function generatePatientId() {
  const uuid = crypto.randomUUID();
  // Remove hyphens and take first 12 chars of UUID for shorter ID
  return 'tp_' + uuid.replace(/-/g, '').substring(0, 12);
}

/**
 * Generate a cryptographically secure assessment/evaluation ID
 * @returns {string} Unique assessment identifier with 'teval_' prefix
 */
export function generateAssessmentId() {
  const uuid = crypto.randomUUID();
  return 'teval_' + uuid.replace(/-/g, '').substring(0, 12);
}

/**
 * Generate a cryptographically secure CAA communication card ID
 * @returns {string} Unique card identifier with 'card_' prefix
 */
export function generateCardId() {
  const uuid = crypto.randomUUID();
  return 'card_' + uuid.replace(/-/g, '').substring(0, 12);
}

/**
 * Generate a generic secure UUID
 * @returns {string} RFC4122 compliant UUID v4
 */
export function generateSecureId() {
  return crypto.randomUUID();
}

/**
 * Validate if an ID looks like it was generated securely (has prefix + random component)
 * @param {string} id - ID to validate
 * @returns {boolean} True if ID appears to use secure generation
 */
export function isSecureId(id) {
  if (!id || typeof id !== 'string') return false;

  // Check for known secure prefixes
  const securePatterns = [
    /^tp_[a-f0-9]{12}$/i,           // Patient ID
    /^teval_[a-f0-9]{12}$/i,        // Assessment ID
    /^card_[a-f0-9]{12}$/i,         // Card ID
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // UUID v4
  ];

  return securePatterns.some(pattern => pattern.test(id));
}
