/**
 * Orofacial Motor Skills Assessment Items (AMIOFE)
 * Avaliação Miofuncional Intra-oral e Orofacial
 */

export const OROFACIAL_STRUCTURES = [
  { id: 'lips', name: 'Lábios', categories: ['posição_repouso', 'mobilidade', 'selamento'] },
  { id: 'tongue', name: 'Língua', categories: ['posição_repouso', 'mobilidade', 'força', 'deglutição'] },
  { id: 'jaw', name: 'Mandíbula', categories: ['posição_repouso', 'mobilidade', 'simetria'] },
  { id: 'palate', name: 'Palato/Véu Palatino', categories: ['posição_repouso', 'mobilidade', 'reflexo_gag'] },
  { id: 'breathing', name: 'Respiração', categories: ['tipo_respiração', 'velocidade', 'simetria'] },
  { id: 'mastication', name: 'Mastigação', categories: ['tipo', 'velocidade', 'simetria'] }
];

export const AMIOFE_RATINGS = [
  { id: 'normal', label: 'Normal', value: 0, color: '#10b981' },
  { id: 'mild_alteration', label: 'Alteração Leve', value: 1, color: '#f59e0b' },
  { id: 'moderate_alteration', label: 'Alteração Moderada', value: 2, color: '#f97316' },
  { id: 'severe_alteration', label: 'Alteração Grave', value: 3, color: '#ef4444' }
];

export const LIPS_ASSESSMENT = {
  position_at_rest: {
    label: 'Posição em Repouso',
    options: [
      'Selados',
      'Ligeiramente abertos (entre 1-3mm)',
      'Abertos (mais de 3mm)',
      'Muito abertos com língua protusa'
    ]
  },
  mobility: {
    label: 'Mobilidade Labial',
    options: [
      'Ótima mobilidade',
      'Boa mobilidade com leve assimetria',
      'Mobilidade reduzida',
      'Imobilidade significativa'
    ]
  },
  seal: {
    label: 'Selamento Labial',
    options: [
      'Selamento completo e fácil',
      'Selamento possível com ligeira dificuldade',
      'Selamento insuficiente',
      'Impossível selamento'
    ]
  }
};

export const TONGUE_ASSESSMENT = {
  position_at_rest: {
    label: 'Posição em Repouso',
    options: [
      'Dentro da cavidade oral, dorso elevado',
      'Dentro da cavidade oral, posição intermediária',
      'Entre os dentes',
      'Protusa além dos dentes'
    ]
  },
  mobility: {
    label: 'Mobilidade Lingual',
    options: [
      'Movimentos ágeis em todas as direções',
      'Movimentos adequados com leve restrição',
      'Movimentos reduzidos em algumas direções',
      'Movimentos severamente limitados'
    ]
  },
  strength: {
    label: 'Força Lingual',
    options: [
      'Força adequada contra resistência',
      'Força presente com leve redução',
      'Força reduzida',
      'Fraqueza significativa'
    ]
  },
  swallowing: {
    label: 'Deglutição',
    options: [
      'Deglutição adequada, sem interposição lingual',
      'Deglutição com ligeira interposição anterior',
      'Deglutição com interposição anterior significativa',
      'Deglutição com interposição anterior grave'
    ]
  }
};

export const JAW_ASSESSMENT = {
  position_at_rest: {
    label: 'Posição em Repouso',
    options: [
      'Adequada com abertura leve',
      'Posição com abertura moderada',
      'Abertura excessiva',
      'Abertura muito excessiva com incompetência labial'
    ]
  },
  mobility: {
    label: 'Mobilidade Mandibular',
    options: [
      'Amplitude de movimento adequada',
      'Amplitude reduzida ligeiramente',
      'Amplitude significativamente reduzida',
      'Restrição severa de movimento'
    ]
  },
  symmetry: {
    label: 'Simetria de Movimento',
    options: [
      'Movimento simétrico e suave',
      'Ligeira assimetria',
      'Desvio moderado ao abrir/fechar',
      'Desvio severo ao abrir/fechar'
    ]
  }
};

export const BREATHING_ASSESSMENT = {
  type: {
    label: 'Tipo de Respiração',
    options: [
      'Nasal adequado',
      'Predominantemente nasal com períodos de bucal',
      'Misto (nasal e bucal em igual proporção)',
      'Bucal predominante'
    ]
  },
  speed: {
    label: 'Velocidade Respiratória',
    options: [
      'Normal para idade',
      'Ligeiramente acelerada',
      'Taquipneia',
      'Bradipneia ou muito irregular'
    ]
  },
  symmetry: {
    label: 'Simetria Nasal',
    options: [
      'Ambas as narinas permeáveis',
      'Ligeira assimetria de fluxo',
      'Assimetria evidente',
      'Obstrução unilateral ou bilateral'
    ]
  }
};

/**
 * Calculate overall orofacial motor score
 */
export function calculateOrofacialScore(responses) {
  const categories = Object.keys(responses);
  const totalCategories = categories.length;
  let totalScore = 0;

  categories.forEach(category => {
    const categoryResponses = Object.values(responses[category] || {})
      .filter(v => v !== undefined && v !== null);
    const categoryScore = categoryResponses.reduce((acc, val) => {
      const ratingObj = AMIOFE_RATINGS.find(r => r.id === val);
      return acc + (ratingObj ? ratingObj.value : 0);
    }, 0);
    totalScore += categoryScore;
  });

  const maxScore = totalCategories * Object.keys(LIPS_ASSESSMENT).length * 3;
  const percentage = totalCategories > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    classification: classifyOrofacialScore(percentage),
    summary: `Alterações encontradas em ${totalScore} pontos avaliados`
  };
}

/**
 * Classify orofacial motor assessment score
 */
function classifyOrofacialScore(percentage) {
  if (percentage === 0) return 'Função Orofacial Normal';
  if (percentage <= 25) return 'Alterações Leves';
  if (percentage <= 50) return 'Alterações Moderadas';
  if (percentage <= 75) return 'Alterações Moderadas a Graves';
  return 'Alterações Graves';
}

/**
 * Get assessment form for specific structure
 */
export function getStructureAssessment(structureId) {
  const assessments = {
    lips: LIPS_ASSESSMENT,
    tongue: TONGUE_ASSESSMENT,
    jaw: JAW_ASSESSMENT,
    breathing: BREATHING_ASSESSMENT
  };
  return assessments[structureId] || {};
}

/**
 * Generate recommendations based on findings
 */
export function getOrofacialRecommendations(responses) {
  const recommendations = [];

  // Lip recommendations
  if (responses.lips?.seal?.includes('moderate') || responses.lips?.seal?.includes('severe')) {
    recommendations.push('Terapia orofacial específica para melhora do selamento labial e competência labial');
  }

  // Tongue recommendations
  if (responses.tongue?.strength?.includes('reduced') || responses.tongue?.strength?.includes('weak')) {
    recommendations.push('Exercícios de fortalecimento lingual com progressão de resistência');
  }

  if (responses.tongue?.swallowing?.includes('interposition')) {
    recommendations.push('Treinamento de deglutição com foco em reeducação da posição lingual');
  }

  // Breathing recommendations
  if (responses.breathing?.type?.includes('bucal')) {
    recommendations.push('Reeducação respiratória com redirecionamento para respiração nasal');
  }

  // Mastication recommendations
  if (responses.mastication?.type?.includes('assimétrica') || responses.mastication?.type?.includes('disfuncional')) {
    recommendations.push('Orientação funcional de mastigação e postura mandibular');
  }

  return recommendations;
}
