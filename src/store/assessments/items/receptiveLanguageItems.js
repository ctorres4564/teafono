/**
 * Receptive Language Assessment Items
 * Based on ABFW-3 and normative research
 */

export const RECEPTIVE_CATEGORIES = [
  { id: 'nouns', name: 'Substantivos', icon: '🎨', description: 'Compreensão de nomes de objetos' },
  { id: 'verbs', name: 'Verbos', icon: '🏃', description: 'Compreensão de ações' },
  { id: 'adjectives', name: 'Adjetivos', icon: '🌈', description: 'Compreensão de qualidades' },
  { id: 'prepositions', name: 'Preposições', icon: '📍', description: 'Compreensão de relações espaciais' },
  { id: 'complex_sentences', name: 'Sentenças Complexas', icon: '📝', description: 'Compreensão de orações' }
];

export const RECEPTIVE_RESPONSE_TYPES = [
  { id: 'correct', label: 'Correto', color: '#10b981' },
  { id: 'incorrect', label: 'Incorreto', color: '#ef4444' },
  { id: 'no_response', label: 'Sem resposta', color: '#6b7280' }
];

export const RECEPTIVE_NOUNS = [
  'bola', 'gato', 'casa', 'mesa', 'livro', 'chave', 'colher',
  'carro', 'árvore', 'pão', 'sapo', 'boneca', 'pato', 'maçã'
];

export const RECEPTIVE_VERBS = [
  'correr', 'dormir', 'comer', 'beber', 'pular', 'cair',
  'abraçar', 'beijar', 'chorar', 'rir', 'andar', 'sentar', 'chutar'
];

export const RECEPTIVE_ADJECTIVES = [
  'grande', 'pequeno', 'quente', 'frio', 'limpo', 'sujo',
  'bonito', 'feio', 'rápido', 'lento', 'pesado', 'leve', 'redondo'
];

export const RECEPTIVE_PREPOSITIONS = [
  'em', 'embaixo', 'em cima', 'dentro', 'fora', 'perto',
  'longe', 'entre', 'atrás', 'na frente', 'ao lado', 'com'
];

export const RECEPTIVE_COMPLEX_SENTENCES = [
  'Mostre o objeto que é grande e redondo.',
  'Aponte onde o gato está embaixo da mesa.',
  'Encontre o livro que está perto da janela.',
  'Mostre o que você come no café da manhã.',
  'Aponte a figura que representa "A menina está comendo uma maçã".',
  'Encontre a imagem que mostra "O cachorro está correndo atrás da bola".',
  'Mostre onde o sapo está pulando na água.'
];

/**
 * Calculate Receptive Language Score
 */
export function calculateReceptiveScore(responses, category) {
  const categoryResponses = Object.entries(responses)
    .filter(([_, r]) => r[category])
    .map(([_, r]) => r[category]);

  const total = categoryResponses.length;
  const correct = categoryResponses.filter(r => r === 'correct').length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    category,
    total,
    correct,
    incorrect: total - correct,
    percentage,
    classification: classifyReceptiveScore(percentage)
  };
}

/**
 * Classify receptive language score
 */
function classifyReceptiveScore(percentage) {
  if (percentage >= 90) return 'Excelente compreensão';
  if (percentage >= 75) return 'Boa compreensão';
  if (percentage >= 60) return 'Compreensão adequada';
  if (percentage >= 40) return 'Compreensão reduzida';
  return 'Compreensão significativamente reduzida';
}

/**
 * Get all receptive items by category
 */
export function getReceptiveItemsByCategory(categoryId) {
  const itemsByCategory = {
    nouns: RECEPTIVE_NOUNS,
    verbs: RECEPTIVE_VERBS,
    adjectives: RECEPTIVE_ADJECTIVES,
    prepositions: RECEPTIVE_PREPOSITIONS,
    complex_sentences: RECEPTIVE_COMPLEX_SENTENCES
  };

  return itemsByCategory[categoryId] || [];
}
