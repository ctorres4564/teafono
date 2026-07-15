/**
 * Developmental Norms for Speech-Language Pathology Assessment
 * Based on: Fernandes, ABFW-3, Wertzner (PCC-R), Fluency research
 */

/**
 * Pragmatic Communication Norms (Fernandes, 2003)
 * Based on acts per minute and communicative means
 */
export const pragmaticNorms = {
  '16-20': {
    atos_min: { min: 1.2, max: 2.5, expected: 1.8 },
    meios_predominantes: ['vocal', 'gestual'],
    interpretacao: 'Início de comunicação intencional',
    referencia: 'Fernandes (2003) - 16-20 months'
  },
  '21-30': {
    atos_min: { min: 2.0, max: 4.0, expected: 3.0 },
    meios_predominantes: ['vocal', 'verbal'],
    interpretacao: 'Transição vocal → verbal começando',
    referencia: 'Fernandes (2003) - 21-30 months'
  },
  '31-40': {
    atos_min: { min: 2.5, max: 4.5, expected: 3.5 },
    meios_predominantes: ['verbal', 'vocal'],
    interpretacao: 'Verbal como principal, vocal complementar',
    referencia: 'Fernandes (2003) - 31-40 months'
  },
  '41-60': {
    atos_min: { min: 3.0, max: 5.0, expected: 4.0 },
    meios_predominantes: ['verbal'],
    interpretacao: 'Verbal predominante, gestos de suporte',
    referencia: 'Fernandes (2003) - 41-60 months'
  }
};

/**
 * Phonological Norms (PCC-R - Percentage of Consonants Correct-Revised)
 * Based on Wertzner & ABFW-3 research
 */
export const phonologyNorms = {
  '18-23': {
    pcc_r_range: { min: 50, max: 75, expected: 62 },
    classification: 'Atraso esperado',
    processes: ['stopping', 'fronting', 'assimilacao'],
    pvc: { min: 80, max: 100, expected: 90 },
    referencia: 'Wertzner - 18-23 months'
  },
  '24-35': {
    pcc_r_range: { min: 70, max: 90, expected: 80 },
    classification: 'Atraso moderado se <70%',
    processes: ['stopping', 'velar_fronting', 'assimilacao'],
    pvc: { min: 85, max: 100, expected: 95 },
    referencia: 'Wertzner - 24-35 months'
  },
  '36-47': {
    pcc_r_range: { min: 85, max: 98, expected: 92 },
    classification: 'Leve atraso se <85%',
    processes: ['velar_fronting', 'dessibilacao', 'reducao_clusters'],
    pvc: { min: 90, max: 100, expected: 98 },
    referencia: 'ABFW-3 - 36-47 months'
  },
  '48-59': {
    pcc_r_range: { min: 95, max: 100, expected: 99 },
    classification: 'Normal se >95%',
    processes: ['dessibilacao_residual', 'reducao_clusters'],
    pvc: { min: 95, max: 100, expected: 100 },
    referencia: 'ABFW-3 - 48-59 months'
  }
};

/**
 * Vocabulary Norms (Type-Token Ratio and Word Count)
 * Based on ABFW-3 and normative research
 */
export const vocabularyNorms = {
  receptive: {
    '12-18': { min: 50, max: 200, expected: 100, ttr: { min: 0.70, max: 1.0, expected: 0.90 } },
    '19-24': { min: 150, max: 300, expected: 200, ttr: { min: 0.75, max: 1.0, expected: 0.92 } },
    '25-36': { min: 200, max: 500, expected: 350, ttr: { min: 0.80, max: 1.0, expected: 0.95 } },
    '37-48': { min: 400, max: 800, expected: 600, ttr: { min: 0.85, max: 1.0, expected: 0.97 } },
    '49-60': { min: 600, max: 1200, expected: 900, ttr: { min: 0.90, max: 1.0, expected: 0.98 } }
  },
  expressive: {
    '12-18': { min: 20, max: 100, expected: 50, ttr: { min: 0.60, max: 1.0, expected: 0.80 } },
    '19-24': { min: 50, max: 200, expected: 100, ttr: { min: 0.65, max: 1.0, expected: 0.85 } },
    '25-36': { min: 100, max: 400, expected: 200, ttr: { min: 0.70, max: 1.0, expected: 0.88 } },
    '37-48': { min: 200, max: 700, expected: 400, ttr: { min: 0.75, max: 1.0, expected: 0.90 } },
    '49-60': { min: 400, max: 1000, expected: 700, ttr: { min: 0.80, max: 1.0, expected: 0.92 } }
  }
};

/**
 * Fluency Norms
 * Speech Rate (words per minute) and Disfluency rates
 */
export const fluencyNorms = {
  speech_rate: {
    '24-36': { min: 80, max: 140, expected: 110, unit: 'words/minute' },
    '37-48': { min: 110, max: 160, expected: 135, unit: 'words/minute' },
    '49-60': { min: 130, max: 180, expected: 155, unit: 'words/minute' },
    adult: { min: 150, max: 180, expected: 165, unit: 'words/minute' }
  },
  disfluency_rate: {
    normal: { max: 5, unit: '% of syllables' },
    mild: { min: 5, max: 10, unit: '% of syllables' },
    moderate: { min: 10, max: 15, unit: '% of syllables' },
    severe: { min: 15, max: 100, unit: '% of syllables' }
  },
  typical_disfluencies_per_100_words: {
    normal: { max: 5, unit: 'repetitions/prolongations/blocks' },
    borderline: { min: 5, max: 10, unit: 'repetitions/prolongations/blocks' },
    concern: { min: 10, max: 100, unit: 'repetitions/prolongations/blocks' }
  }
};

/**
 * Pragmatic Functions by Age
 * Expected communicative functions
 */
export const pragmaticFunctions = {
  '16-24': ['pedido', 'protesto', 'atenção_conjunta'],
  '25-36': ['pedido', 'protesto', 'atenção_conjunta', 'comentário', 'pergunta_simples'],
  '37-48': ['pedido', 'protesto', 'atenção_conjunta', 'comentário', 'pergunta', 'resposta', 'brincadeira_simbólica'],
  '49-60': ['pedido', 'protesto', 'atenção_conjunta', 'comentário', 'pergunta', 'resposta', 'narrativa_simples', 'negociação'],
  'adult': ['todas', 'incluindo', 'abstratas', 'e', 'figuradas']
};

/**
 * Phonological Processes Expected by Age
 * Which processes should be present vs. eliminated
 */
export const phonologicalProcesses = {
  '18-24': {
    presentes: ['stopping', 'fronting', 'assimilacao', 'reducao_silaba'],
    eliminados: ['reduplicacao'],
    referencia: 'Processes expected in early development'
  },
  '25-36': {
    presentes: ['stopping_residual', 'fronting', 'assimilacao_residual', 'dessibilacao'],
    eliminados: ['reduplicacao', 'assimilacao_completa'],
    referencia: 'Early preschool processes'
  },
  '37-48': {
    presentes: ['dessibilacao_residual', 'reducao_clusters_alguns', 'fronting_residual'],
    eliminados: ['stopping', 'fronting_completo', 'assimilacao'],
    referencia: 'Preschool age processes'
  },
  '49-60': {
    presentes: ['dessibilacao_residual_minima', 'reducao_clusters_alguns'],
    eliminados: ['stopping', 'fronting', 'assimilacao', 'dessibilacao_completa'],
    referencia: 'Near-normal phonology'
  }
};

/**
 * Interpret PCC-R score
 */
export function interpretPCCR(pcc_r, ageMonths) {
  const ageGroup = getAgeGroup(ageMonths, Object.keys(phonologyNorms));
  const norm = phonologyNorms[ageGroup];

  if (pcc_r >= norm.pcc_r_range.min + 15) {
    return { classification: 'Acima do esperado', severity: 0 };
  }
  if (pcc_r >= norm.pcc_r_range.expected) {
    return { classification: 'Dentro do esperado', severity: 0 };
  }
  if (pcc_r >= norm.pcc_r_range.expected - 10) {
    return { classification: 'Leve atraso', severity: 1 };
  }
  if (pcc_r >= norm.pcc_r_range.min) {
    return { classification: 'Atraso moderado', severity: 2 };
  }
  return { classification: 'Atraso grave', severity: 3 };
}

/**
 * Interpret pragmatic acts per minute
 */
export function interpretPragmatics(atosPerMinute, ageMonths) {
  const ageGroup = getAgeGroup(ageMonths, Object.keys(pragmaticNorms));
  const norm = pragmaticNorms[ageGroup];

  if (atosPerMinute >= norm.atos_min.expected) {
    return { classification: 'Dentro do esperado', severity: 0 };
  }
  if (atosPerMinute >= norm.atos_min.min + 0.5) {
    return { classification: 'Leve atraso', severity: 1 };
  }
  if (atosPerMinute >= norm.atos_min.min) {
    return { classification: 'Atraso moderado', severity: 2 };
  }
  return { classification: 'Atraso grave', severity: 3 };
}

/**
 * Calculate Type-Token Ratio (lexical diversity)
 */
export function calculateTTR(totalWords, uniqueWords) {
  if (totalWords === 0) return 0;
  return (uniqueWords / totalWords).toFixed(3);
}

/**
 * Interpret TTR
 */
export function interpretTTR(ttr) {
  if (ttr > 0.80) return 'Ótima diversidade lexical';
  if (ttr > 0.60) return 'Boa diversidade lexical';
  if (ttr > 0.40) return 'Diversidade lexical adequada';
  if (ttr > 0.20) return 'Redução em diversidade - considera repetição';
  return 'Severamente reduzida - possível perseveração';
}

/**
 * Get age group from continuous age months
 */
function getAgeGroup(ageMonths, groups) {
  const numericGroups = groups
    .filter(g => !isNaN(parseInt(g)))
    .map(g => ({ range: g, min: parseInt(g) }))
    .sort((a, b) => a.min - b.min);

  for (let i = 0; i < numericGroups.length; i++) {
    const current = numericGroups[i];
    const next = numericGroups[i + 1];

    if (ageMonths >= current.min) {
      if (!next || ageMonths < next.min) {
        return current.range;
      }
    }
  }

  return numericGroups[0].range; // Default to first group
}

/**
 * Get all norms for a given age
 */
export function getNormsForAge(ageMonths) {
  return {
    pragmatics: pragmaticNorms[getAgeGroup(ageMonths, Object.keys(pragmaticNorms))],
    phonology: phonologyNorms[getAgeGroup(ageMonths, Object.keys(phonologyNorms))],
    vocabulary: {
      receptive: vocabularyNorms.receptive[getAgeGroup(ageMonths, Object.keys(vocabularyNorms.receptive))],
      expressive: vocabularyNorms.expressive[getAgeGroup(ageMonths, Object.keys(vocabularyNorms.expressive))]
    },
    phonologicalProcesses: phonologicalProcesses[getAgeGroup(ageMonths, Object.keys(phonologicalProcesses))]
  };
}

/**
 * Comparison function: returns severity level
 * Returns: 0 (normal), 1 (borderline), 2 (concern), 3 (severe)
 */
export function compareToDevelopmentalNorm(value, expectedRange) {
  if (!expectedRange) return null;

  if (value >= expectedRange.expected) return 0; // Normal
  if (value >= (expectedRange.expected - expectedRange.expected * 0.2)) return 1; // Borderline (20% below)
  if (value >= expectedRange.min) return 2; // Concern (below 20%)
  return 3; // Severe (below minimum)
}
