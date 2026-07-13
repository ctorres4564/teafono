import { debugLog } from '../utils/debug';

export function isLocalNewer(firestorePat, localPat) {
  const fTime = new Date(firestorePat.createdAt || 0).getTime();
  const lTime = new Date(localPat.createdAt || 0).getTime();
  return lTime >= fTime && localPat.history?.length >= (firestorePat.history?.length || 0);
}

export function getLocalsToSync(localParsed, merged) {
  return localParsed.filter((lPat) => !merged.find((m) => m.id === lPat.id));
}

/**
 * Remove pacientes de demonstração (semeados pelo Modo Convidado) de uma lista.
 * Nunca devem ser migrados/sincronizados para uma conta real no Firestore.
 */
export function stripDemoPatients(list) {
  return list.filter((p) => !p.isDemo);
}

export async function mergePatients({
  firestoreList,
  firestoreError,
  userLocalRaw,
  guestLocalRaw,
  syncPatientsToFirestore,
  loadAndVerifyFirestore,
}) {
  const mergeLocalRaw = userLocalRaw || guestLocalRaw || null;
  const isGuestSource = !userLocalRaw && !!guestLocalRaw;

  if (firestoreList && firestoreList.length > 0) {
    let merged = [...firestoreList];
    if (mergeLocalRaw) {
      try {
        const localRawParsed = JSON.parse(mergeLocalRaw);
        const localParsed = isGuestSource && Array.isArray(localRawParsed)
          ? stripDemoPatients(localRawParsed)
          : localRawParsed;
        if (Array.isArray(localParsed) && localParsed.length > 0) {
          merged = firestoreList.map((fPat) => {
            const localPat = localParsed.find((l) => l.id === fPat.id);
            if (localPat && isLocalNewer(fPat, localPat)) {
              return JSON.parse(JSON.stringify(localPat));
            }
            return fPat;
          });
          const localsToSync = getLocalsToSync(localParsed, merged);
          if (localsToSync.length > 0) {
            debugLog(`[mergePatients] Sincronizando ${localsToSync.length} paciente(s) locais com o Firestore`);
            const syncResult = await syncPatientsToFirestore(localsToSync);
            if (syncResult.success) {
              const fresh = await loadAndVerifyFirestore();
              if (fresh && fresh.length > 0) {
                merged = [...fresh];
                debugLog(`[mergePatients] Após sync, Firestore tem ${fresh.length} pacientes`);
              } else {
                // Sync confirmado, mas a releitura falhou/veio vazia: não descarta os
                // pacientes que acabaram de ser sincronizados.
                merged = [...merged, ...localsToSync];
              }
            } else {
              // Sync falhou: os pacientes/avaliações locais nunca chegaram ao Firestore.
              // `merged` (baseado em firestoreList) nunca os incluiu — sem isto eles
              // desapareceriam da tela mesmo estando salvos no localStorage.
              console.warn('[mergePatients] Sync parcial/falha — mantendo pacientes locais que não sincronizaram');
              merged = [...merged, ...localsToSync];
            }
          }
        }
      } catch (e) {
        console.error('[mergePatients] Erro ao fazer merge:', e);
      }
    }
    return { patients: merged };
  }

  if (firestoreError) {
    const fallbackRaw = userLocalRaw || guestLocalRaw;
    if (fallbackRaw) {
      try {
        const rawParsed = JSON.parse(fallbackRaw);
        const parsed = isGuestSource && Array.isArray(rawParsed) ? stripDemoPatients(rawParsed) : rawParsed;
        if (Array.isArray(parsed)) {
          debugLog(`[mergePatients] Fallback para dados locais: ${parsed.length} pacientes`);
          return { patients: parsed };
        }
      } catch (e) {
        console.error('[mergePatients] Erro ao ler fallback local:', e);
      }
    }
    return { patients: [] };
  }

  const localSource = userLocalRaw || guestLocalRaw || null;
  if (localSource) {
    try {
      const rawParsed = JSON.parse(localSource);
      const parsed = isGuestSource && Array.isArray(rawParsed) ? stripDemoPatients(rawParsed) : rawParsed;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const syncResult = await syncPatientsToFirestore(parsed);
        if (syncResult.success) {
          const fresh = await loadAndVerifyFirestore();
          if (fresh && fresh.length > 0) {
            debugLog(`[mergePatients] Após sync, Firestore tem ${fresh.length} pacientes`);
            return { patients: fresh, isGuestMigration: isGuestSource, migratedCount: parsed.length };
          }
        } else {
          console.warn('[mergePatients] Sync para nuvem teve falhas — dados mantidos localmente');
        }
        return { patients: parsed, isGuestMigration: isGuestSource, migratedCount: parsed.length };
      }
    } catch (e) {
      console.error('[mergePatients] Erro ao processar dados locais:', e);
    }
  } else {
    debugLog('[mergePatients] Nenhum dado encontrado. Iniciando vazio.');
  }

  return { patients: [] };
}
