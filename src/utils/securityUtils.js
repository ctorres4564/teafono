/**
 * Utilitários de Segurança e Sanitização para o TeaFono.
 * Focado em mitigar vulnerabilidades de XSS (Cross-Site Scripting) em campos de texto livre.
 */

/**
 * Sanitiza uma string de texto removendo tags HTML e scripts maliciosos.
 * @param {string} text - O texto a ser sanitizado.
 * @returns {string} O texto limpo e seguro.
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  
  return text
    // Remove tags script completas
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    // Remove tags HTML em geral
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Remove handlers de eventos comuns em HTML (onload, onerror, onclick, etc.)
    .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
    // Remove javascript: pseudo-protocolo
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Sanitiza recursivamente um objeto ou array limpando todos os campos de string contidos nele.
 * @param {any} obj - O objeto ou valor a ser sanitizado.
 * @returns {any} O objeto ou valor sanitizado.
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Realiza validações de segurança básicas e de integridade nos dados do formulário de Anamnese.
 * @param {object} data - Os dados da anamnese vindos do formulário.
 * @returns {{ valid: boolean, error?: string }} Resultado da validação.
 */
export function validateAnamneseForm(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Dados da Anamnese inválidos ou ausentes.' };
  }

  // Se a seção de identificação estiver presente, valida seus campos
  if (data.identification) {
    const { phone, birthDate } = data.identification;

    // Se o telefone foi preenchido, validar tamanho mínimo/máximo simples para evitar estouros
    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length > 0 && (cleanPhone.length < 8 || cleanPhone.length > 15)) {
        return { valid: false, error: 'Número de telefone inválido (deve conter entre 8 e 15 dígitos).' };
      }
    }

    // Validação simples de data de nascimento para evitar datas futuras incoerentes
    if (birthDate && typeof birthDate === 'string') {
      const bDate = new Date(birthDate + 'T00:00:00');
      const today = new Date();
      if (bDate > today) {
        return { valid: false, error: 'A data de nascimento não pode ser no futuro.' };
      }
    }
  }

  return { valid: true };
}
