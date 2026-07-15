/**
 * Phonological Awareness Assessment Items
 * Consciência Fonêmica e Fonológica
 */

export const AWARENESS_SUBTESTS = [
  { id: 'rhyme', name: 'Rima', icon: '🎵', description: 'Identificação e produção de rimas' },
  { id: 'syllable_count', name: 'Contagem de Sílabas', icon: '📊', description: 'Contagem e segmentação silábica' },
  { id: 'syllable_segmentation', name: 'Segmentação Silábica', icon: '✂️', description: 'Divisão de palavras em sílabas' },
  { id: 'phoneme_identification', name: 'Identificação de Fonemas', icon: '🔤', description: 'Identificação de sons individuais' },
  { id: 'phoneme_blending', name: 'Blending de Fonemas', icon: '🔗', description: 'Fusão de sons para formar palavras' },
  { id: 'phoneme_deletion', name: 'Deleção de Fonemas', icon: '❌', description: 'Remoção de sons de palavras' }
];

export const RESPONSE_TYPES = [
  { id: 'correct', label: 'Correto', color: '#10b981', value: 2 },
  { id: 'self_corrected', label: 'Autocorrigido', color: '#f59e0b', value: 1 },
  { id: 'incorrect', label: 'Incorreto', color: '#ef4444', value: 0 }
];

export const RHYME_TASKS = [
  { stimulus: 'gato', options: ['pato', 'cão', 'peixe'], correct: 'pato' },
  { stimulus: 'casa', options: ['porta', 'vasa', 'rua'], correct: 'vasa' },
  { stimulus: 'sol', options: ['lua', 'mol', 'mar'], correct: 'mol' },
  { stimulus: 'pé', options: ['chá', 'mão', 'três'], correct: 'três' },
  { stimulus: 'livro', options: ['livro', 'cabro', 'porta'], correct: 'cabro' }
];

export const SYLLABLE_WORDS = {
  one: ['pé', 'tá', 'bom'],
  two: ['gato', 'casa', 'bola'],
  three: ['abacaxi', 'borboleta', 'maçã'],
  four: ['computador', 'brinquedo', 'biblioteca'],
  five: ['formiga', 'telefone', 'elefante']
};

export const PHONEME_TASKS = [
  { word: 'bola', target_phoneme: '/b/', position: 'initial', context: 'Som inicial' },
  { word: 'casa', target_phoneme: '/k/', position: 'initial', context: 'Som inicial' },
  { word: 'sol', target_phoneme: '/l/', position: 'final', context: 'Som final' },
  { word: 'pato', target_phoneme: '/t/', position: 'medial', context: 'Som no meio' },
  { word: 'mão', target_phoneme: '/m/', position: 'initial', context: 'Som inicial' }
];

export const BLENDING_TASKS = [
  { phonemes: '/p/ /ã/ /w/', word: 'pão', hint: 'Alimento doce' },
  { phonemes: '/g/ /a/ /t/ /w/', word: 'gato', hint: 'Animal de estimação' },
  { phonemes: '/b/ /o/ /l/ /a/', word: 'bola', hint: 'Brinquedo redondo' },
  { phonemes: '/k/ /a/ /s/ /a/', word: 'casa', hint: 'Lugar onde vivemos' },
  { phonemes: '/s/ /o/ /l/', word: 'sol', hint: 'Estrela do dia' }
];

export const DELETION_TASKS = [
  { word: 'pato', remove: 'p', result: 'ato', context: 'remova som inicial' },
  { word: 'bola', remove: 'b', result: 'ola', context: 'remova som inicial' },
  { word: 'casa', remove: 'a', result: 'csa', context: 'remova primeira vogal' },
  { word: 'livro', remove: 'l', result: 'ivro', context: 'remova som inicial' },
  { word: 'gato', remove: 'to', result: 'ga', context: 'remova final' }
];

/**
 * Calculate Phonological Awareness Score
 */
export function calculatePhonologicalAwarenessScore(responses) {
  const subtests = Object.keys(responses);
  const totalSubtests = subtests.length;
  let totalScore = 0;
  let maxTotalScore = 0;
  const subtestScores = {};

  subtests.forEach(subtest => {
    const subtestResponses = Object.values(responses[subtest] || {});
    const subtestScore = subtestResponses.reduce((acc, response) => {
      const ratingObj = RESPONSE_TYPES.find(r => r.id === response);
      return acc + (ratingObj ? ratingObj.value : 0);
    }, 0);
    const subtestMax = subtestResponses.length * 2;

    subtestScores[subtest] = {
      score: subtestScore,
      max: subtestMax,
      percentage: subtestMax > 0 ? Math.round((subtestScore / subtestMax) * 100) : 0
    };

    totalScore += subtestScore;
    maxTotalScore += subtestMax;
  });

  const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  return {
    totalScore,
    maxTotalScore,
    percentage,
    classification: classifyPhonologicalAwareness(percentage),
    subtestScores
  };
}

/**
 * Classify Phonological Awareness Score
 */
function classifyPhonologicalAwareness(percentage) {
  if (percentage >= 90) return 'Consciência Fonológica Muito Boa';
  if (percentage >= 75) return 'Consciência Fonológica Boa';
  if (percentage >= 60) return 'Consciência Fonológica Adequada';
  if (percentage >= 40) return 'Consciência Fonológica em Desenvolvimento';
  if (percentage >= 20) return 'Consciência Fonológica Reduzida';
  return 'Consciência Fonológica Ausente/Grave';
}

/**
 * Generate therapeutic recommendations
 */
export function getPhonologicalAwarenessRecommendations(subtestScores) {
  const recommendations = [];

  if (!subtestScores.rhyme || subtestScores.rhyme.percentage < 60) {
    recommendations.push('Trabalhar rimas com jogos e músicas');
  }

  if (!subtestScores.syllable_count || subtestScores.syllable_count.percentage < 60) {
    recommendations.push('Treinar contagem de sílabas com batidas/palmas');
  }

  if (!subtestScores.phoneme_identification || subtestScores.phoneme_identification.percentage < 60) {
    recommendations.push('Exercitar discriminação e identificação de sons iniciais');
  }

  if (!subtestScores.phoneme_blending || subtestScores.phoneme_blending.percentage < 60) {
    recommendations.push('Iniciar treinamento de síntese fonêmica (blending)');
  }

  if (!subtestScores.phoneme_deletion || subtestScores.phoneme_deletion.percentage < 60) {
    recommendations.push('Postergar tarefas de deleção fonêmica para fase posterior');
  }

  return recommendations;
}
