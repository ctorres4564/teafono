/**
 * Encryption utilities for protecting sensitive data at rest (localStorage)
 * Uses browser-native Web Crypto API for AES-GCM encryption
 *
 * Note: For production, consider using a dedicated crypto library like NaCl.js
 * This implementation provides basic protection against XSS and physical access
 */

/**
 * Derive an encryption key from a user ID using PBKDF2
 * Makes the key unique per user without storing a master key
 *
 * @param {string} userId - Firebase user ID (UID)
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
async function deriveKey(userId) {
  // Import user ID as raw key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userId + '_teafono_salt_v1'),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive a 256-bit key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('teafono_fixed_salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data for storage in localStorage
 * Uses AES-256-GCM with a random IV
 *
 * @param {any} data - Data to encrypt (will be JSON stringified)
 * @param {string} userId - User ID for key derivation
 * @returns {Promise<string>} Base64-encoded encrypted data with IV
 */
export async function encryptData(data, userId) {
  try {
    if (!userId) {
      console.warn('[encryption] No user ID provided, returning plaintext');
      return JSON.stringify(data); // Fallback for guest mode
    }

    const key = await deriveKey(userId);
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      plaintext
    );

    // Combine IV + ciphertext and encode as base64 for storage
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(new Uint8Array(iv), 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[encryption] Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt data stored in localStorage
 * Extracts IV and decrypts using AES-256-GCM
 *
 * @param {string} encrypted - Base64-encoded encrypted data from localStorage
 * @param {string} userId - User ID for key derivation (must match encryption)
 * @returns {Promise<any>} Decrypted and JSON-parsed data
 */
export async function decryptData(encrypted, userId) {
  try {
    if (!userId) {
      console.warn('[encryption] No user ID provided, treating as plaintext');
      return JSON.parse(encrypted); // Fallback for guest mode
    }

    const key = await deriveKey(userId);
    const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch (error) {
    console.error('[encryption] Decryption failed:', error);
    throw error;
  }
}

/**
 * Check if a string appears to be encrypted (base64-encoded binary data)
 * Used to detect if localStorage contains encrypted vs plaintext data
 *
 * @param {string} data - Data to check
 * @returns {boolean} True if data appears encrypted
 */
export function isEncrypted(data) {
  if (!data || typeof data !== 'string') return false;

  try {
    // Try to decode as base64
    const decoded = atob(data);

    // Encrypted data should be >= 12 bytes (IV) + minimum ciphertext
    // and should contain mostly non-ASCII bytes
    const bytes = decoded.split('').map(c => c.charCodeAt(0));
    const nonASCII = bytes.filter(b => b > 127).length;

    return decoded.length >= 28 && nonASCII > decoded.length * 0.5;
  } catch {
    return false;
  }
}
