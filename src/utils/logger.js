/**
 * Central de Logs Detalhados para o TeaFono.
 * Suporta logs no Console em desenvolvimento, persistência em Cache local offline e upload para o Firebase Firestore.
 */

import { saveLogToFirestore, isFirebaseEnabled, auth } from '../firebase';

const OFFLINE_LOGS_KEY = 'teafono_offline_logs';

/**
 * Filtra e remove PII (Informações Pessoais Identificáveis) dos metadados de logs antes do salvamento na nuvem.
 */
function sanitizeMetadata(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  
  const cleaned = { ...meta };
  const sensitiveKeys = ['name', 'phone', 'birthDate', 'speechComplaint', 'diagnosis', 'queixa', 'responsible', 'email'];
  
  for (const key of sensitiveKeys) {
    if (key in cleaned) {
      cleaned[key] = '[REDACTED]';
    }
  }

  // Se houver objetos aninhados, limpa-os também
  for (const [key, value] of Object.entries(cleaned)) {
    if (value && typeof value === 'object') {
      cleaned[key] = sanitizeMetadata(value);
    }
  }

  return cleaned;
}

/**
 * Cria uma entrada de log formatada.
 */
function createLogEntry(level, message, context = {}) {
  const user = auth?.currentUser;
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    userId: user ? user.uid : 'anonymous',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    context: sanitizeMetadata(context)
  };
}

/**
 * Enfileira um log localmente no localStorage para posterior sincronização.
 */
function enqueueOfflineLog(logEntry) {
  try {
    const existingRaw = localStorage.getItem(OFFLINE_LOGS_KEY);
    const logs = existingRaw ? JSON.parse(existingRaw) : [];
    logs.push(logEntry);
    
    // Limita a fila local a no máximo 100 logs para evitar consumo excessivo de localStorage
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('[Logger] Erro ao enfileirar log offline:', err);
  }
}

/**
 * Registra um log de sistema.
 * @param {'INFO'|'WARN'|'ERROR'} level - O nível do log.
 * @param {string} message - Mensagem descritiva.
 * @param {object} context - Metadados de contexto.
 */
export async function logEvent(level, message, context = {}) {
  const logEntry = createLogEntry(level, message, context);

  // 1. Console Logging (DEV/Formatado)
  if (import.meta.env.DEV) {
    const colors = {
      INFO: 'color: #3b82f6; font-weight: bold;',
      WARN: 'color: #f59e0b; font-weight: bold;',
      ERROR: 'color: #ef4444; font-weight: bold;'
    };
    console.log(`%c[${logEntry.level}] %c${logEntry.message}`, colors[logEntry.level] || '', 'color: inherit;', logEntry.context);
  }

  // 2. Firebase / Local Storage Logging
  const user = auth?.currentUser;
  if (isFirebaseEnabled() && user) {
    try {
      const result = await saveLogToFirestore(logEntry, user.uid);
      if (!result.success) {
        enqueueOfflineLog(logEntry);
      }
    } catch (err) {
      enqueueOfflineLog(logEntry);
    }
  } else {
    // Se não há usuário autenticado ou está sem Firebase (Guest / Offline), salva no cache local
    enqueueOfflineLog(logEntry);
  }
}

// Atalhos convenientes
export const logInfo = (msg, context) => logEvent('INFO', msg, context);
export const logWarn = (msg, context) => logEvent('WARN', msg, context);
export const logError = (msg, error, context = {}) => {
  const errContext = {
    ...context,
    errorName: error?.name,
    errorMessage: error?.message,
    errorStack: error?.stack
  };
  return logEvent('ERROR', msg, errContext);
};

/**
 * Envia todos os logs armazenados offline para o Firestore do usuário logado.
 * @param {string} userId - ID do usuário autenticado.
 */
export async function flushOfflineLogs(userId) {
  if (!isFirebaseEnabled() || !userId) return;

  try {
    const existingRaw = localStorage.getItem(OFFLINE_LOGS_KEY);
    if (!existingRaw) return;

    const logs = JSON.parse(existingRaw);
    if (logs.length === 0) return;

    if (import.meta.env.DEV) {
      console.log(`[Logger] Enviando ${logs.length} logs acumulados offline para o Firestore...`);
    }

    const failedLogs = [];

    for (const log of logs) {
      // Atualiza o userId caso estivesse 'anonymous' no momento em que logou offline
      if (log.userId === 'anonymous' || !log.userId) {
        log.userId = userId;
      }
      
      const result = await saveLogToFirestore(log, userId);
      if (!result.success) {
        failedLogs.push(log);
      }
    }

    if (failedLogs.length > 0) {
      localStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(failedLogs));
    } else {
      localStorage.removeItem(OFFLINE_LOGS_KEY);
    }
  } catch (err) {
    console.error('[Logger] Erro ao sincronizar logs offline:', err);
  }
}
