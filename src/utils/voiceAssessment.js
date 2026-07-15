/**
 * Voice Assessment Utilities
 * GRBAS Protocol + Dysphonia Severity Index (DSI)
 *
 * GRBAS: Grade, Roughness, Breathiness, Asthenia, Strain
 * Scale 0-3 for each parameter (0=normal, 3=severe)
 */

export const GRBAS_SCALES = {
  grade: {
    0: 'Normal',
    1: 'Leve',
    2: 'Moderada',
    3: 'Grave'
  },
  roughness: {
    0: 'Ausente',
    1: 'Leve (detectável)',
    2: 'Moderada (claramente presente)',
    3: 'Severa (predominante)'
  },
  breathiness: {
    0: 'Ausente',
    1: 'Leve (quase imperceptível)',
    2: 'Moderada (clara)',
    3: 'Severa (muita aspiração)'
  },
  asthenia: {
    0: 'Ausente',
    1: 'Leve (redução de intensidade)',
    2: 'Moderada (voz fraca)',
    3: 'Severa (voz muito fraca)'
  },
  strain: {
    0: 'Ausente',
    1: 'Leve (esforço detectável)',
    2: 'Moderada (esforço claro)',
    3: 'Severa (muita tensão muscular)'
  }
};

export const RESONANCE_TYPES = {
  normal: 'Normal',
  hyponasal: 'Hiponasal (nasal bloqueado)',
  hypernasal: 'Hipernasal (escape nasal)',
  mixed: 'Mista'
};

export const PITCH_RANGES = {
  normal_female: { min: 130, max: 260 }, // Hz
  normal_male: { min: 65, max: 130 },
  normal_child: { min: 150, max: 300 }
};

/**
 * Calculate overall voice quality grade based on GRBAS parameters
 */
export function calculateVoiceGrade(grbas) {
  const average = (grbas.grade + grbas.roughness + grbas.breathiness +
                   grbas.asthenia + grbas.strain) / 5;

  if (average >= 2.5) return 3; // Severe
  if (average >= 1.5) return 2; // Moderate
  if (average >= 0.5) return 1; // Mild
  return 0; // Normal
}

/**
 * Calculate Dysphonia Severity Index (DSI)
 * DSI = (0.13 × Fo_max) + (0.11 × Fo_min) - (0.02 × jitter) - (0.05 × shimmer)
 * More simple version for clinical use
 *
 * DSI > 1.6 = Normal voice
 * 1.6 > DSI > 0.5 = Mild dysphonia
 * 0.5 > DSI > -0.5 = Moderate dysphonia
 * DSI < -0.5 = Severe dysphonia
 */
export function calculateDSI(parameters) {
  const { maxFrequency, minFrequency, jitter, shimmer } = parameters;

  if (!maxFrequency || !minFrequency) return null;

  const dsi = (0.13 * maxFrequency) + (0.11 * minFrequency) -
              (0.02 * (jitter || 0)) - (0.05 * (shimmer || 0));

  return dsi;
}

/**
 * Classify DSI value
 */
export function classifyDSI(dsi) {
  if (dsi > 1.6) return { classification: 'Normal', severity: 0 };
  if (dsi > 0.5) return { classification: 'Leve', severity: 1 };
  if (dsi > -0.5) return { classification: 'Moderada', severity: 2 };
  return { classification: 'Grave', severity: 3 };
}

/**
 * Interpret GRBAS overall results
 */
export function interpretGRBAS(grbas) {
  const interpretations = [];

  if (grbas.grade >= 2) {
    interpretations.push('Qualidade vocal alterada significativamente');
  }

  if (grbas.roughness >= 2) {
    interpretations.push('Presença significativa de aspereza - investigar nódulos/pólipos');
  }

  if (grbas.breathiness >= 2) {
    interpretations.push('Escape aéreo importante - investigar paralisia de prega vocal');
  }

  if (grbas.asthenia >= 2) {
    interpretations.push('Redução importante de intensidade - possível fraqueza muscular');
  }

  if (grbas.strain >= 2) {
    interpretations.push('Esforço importante - possível tensão muscular ou compensatória');
  }

  return interpretations.length > 0 ? interpretations : ['Voz dentro dos limites normais'];
}

/**
 * Voice pathology recommendations based on findings
 */
export function getVoiceRecommendations(grbas, resonance) {
  const recommendations = [];

  // Grade-based recommendations
  if (grbas.grade >= 2) {
    recommendations.push({
      type: 'Encaminhamento',
      description: 'Otorrinolaringologia - avaliação de estruturas laríngeas'
    });
  }

  // Roughness
  if (grbas.roughness >= 2) {
    recommendations.push({
      type: 'Encaminhamento',
      description: 'ORL - videoestroboscopia para visualizar dinâmica de pregas vocais'
    });
    recommendations.push({
      type: 'Intervenção',
      description: 'Higiene vocal, repouso vocal relativo, técnicas de proteção laríngea'
    });
  }

  // Breathiness
  if (grbas.breathiness >= 2) {
    recommendations.push({
      type: 'Encaminhamento',
      description: 'ORL - possível paralisia de prega vocal'
    });
    recommendations.push({
      type: 'Intervenção',
      description: 'Técnicas de aumento de intensidade, fechamento glótico'
    });
  }

  // Asthenia
  if (grbas.asthenia >= 2) {
    recommendations.push({
      type: 'Intervenção',
      description: 'Exercícios de fortalecimento vocal, terapia de voz'
    });
  }

  // Strain
  if (grbas.strain >= 2) {
    recommendations.push({
      type: 'Intervenção',
      description: 'Técnicas de relaxamento, redução de tensão muscular, reposicionamento laríngeo'
    });
  }

  // Resonance issues
  if (resonance === 'hypernasal') {
    recommendations.push({
      type: 'Encaminhamento',
      description: 'ORL - avaliação de velofaringe, possível fissura palatina ou insuficiência velofaríngea'
    });
    recommendations.push({
      type: 'Avaliação',
      description: 'Teste de Hipernasalidade (espelho ou aeração) + possível nasofibroscopia'
    });
  }

  if (resonance === 'hyponasal') {
    recommendations.push({
      type: 'Encaminhamento',
      description: 'ORL - avaliação de rinite, congestão nasal, desvio septal'
    });
  }

  return recommendations;
}

/**
 * Voice pathology classification
 */
export function classifyVoicePathology(grbas, resonance) {
  if (grbas.grade <= 0 && resonance === 'normal') {
    return 'Normal';
  }

  if (grbas.roughness >= 2 || grbas.breathiness >= 2) {
    return 'Alteração Estrutural Provável';
  }

  if (grbas.strain >= 2 || grbas.asthenia >= 2) {
    return 'Alteração Funcional Provável';
  }

  if (resonance !== 'normal') {
    return 'Alteração de Ressonância';
  }

  return 'Disfonia Leve';
}

/**
 * Voice norms by age/gender
 */
export const VOICE_NORMS = {
  female_adult: {
    fundamental_frequency: { min: 130, max: 260 },
    jitter_max: 1.04, // %
    shimmer_max: 3.81, // dB
    nhr_max: 0.190 // Noise-to-Harmonic Ratio
  },
  male_adult: {
    fundamental_frequency: { min: 65, max: 130 },
    jitter_max: 1.04,
    shimmer_max: 3.81,
    nhr_max: 0.190
  },
  child_3_6: {
    fundamental_frequency: { min: 150, max: 300 },
    jitter_max: 1.50,
    shimmer_max: 4.50,
    nhr_max: 0.250
  },
  child_6_12: {
    fundamental_frequency: { min: 120, max: 280 },
    jitter_max: 1.20,
    shimmer_max: 4.00,
    nhr_max: 0.220
  }
};
