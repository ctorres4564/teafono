import { useCallback, useState } from 'react';
import useStore from '../store/useStore';

/**
 * Encapsula o salvamento de uma avaliação: aguarda saveAssessmentResults,
 * expõe o status (saving/saved/saved-offline/error) para feedback visual e
 * só dispara onSaved quando a gravação local é confirmada.
 */
export default function useSaveAssessment({ patientId, entryId, onSaved } = {}) {
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = useCallback(async (moduleName, results, id) => {
    setSaveStatus('saving');
    try {
      const result = await useStore.getState().saveAssessmentResults(moduleName, results, id || entryId, patientId);
      if (result?.success) {
        setSaveStatus(result.cloudSynced === false ? 'saved-offline' : 'saved');
        if (onSaved) setTimeout(() => onSaved(result), 600);
      } else {
        console.error(`[useSaveAssessment] Falha ao salvar ${moduleName}:`, result?.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 4000);
      }
      return result;
    } catch (err) {
      console.error(`[useSaveAssessment] Erro ao salvar ${moduleName}:`, err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 4000);
      return { success: false, error: err.message };
    }
  }, [patientId, entryId, onSaved]);

  return { saveStatus, handleSave };
}
