export const VOCABULARY_CATEGORIES = [
  {
    id: 'animais',
    name: 'Animais',
    icon: '🐾',
    words: [
      { id: 'vw1', target: 'Cachorro', imageUrl: '/assets/images/phonology/cachorro_ilustracao_1784132950201.png' },
      { id: 'vw2', target: 'Gato', imageUrl: '/assets/images/phonology/gato_ilustracao_1784079695633.png' },
      { id: 'vw3', target: 'Vaca', imageUrl: '/assets/images/phonology/vaca_ilustracao_1784079733650.png' }
    ],
  },
  {
    id: 'alimentos',
    name: 'Alimentos',
    icon: '🍎',
    words: [
      { id: 'vw4', target: 'Banana', imageUrl: '/assets/images/vocabulary/banana_ilustracao_1784133814171.png' },
      { id: 'vw5', target: 'Maçã', imageUrl: '/assets/images/vocabulary/maca_ilustracao_1784133837968.png' },
      { id: 'vw6', target: 'Bolo', imageUrl: '/assets/images/vocabulary/bolo_ilustracao_1784133860169.png' }
    ],
  },
  {
    id: 'profissoes',
    name: 'Profissões',
    icon: '👨‍⚕️',
    words: [
      { id: 'vw7', target: 'Médico', imageUrl: '/assets/images/vocabulary/medico_ilustracao_1784133881680.png' },
      { id: 'vw8', target: 'Professor', imageUrl: '/assets/images/vocabulary/professor_ilustracao_1784133903590.png' },
      { id: 'vw9', target: 'Bombeiro', imageUrl: '/assets/images/vocabulary/bombeiro_ilustracao_1784133924022.png' }
    ],
  },
  {
    id: 'brinquedos',
    name: 'Brinquedos',
    icon: '🧸',
    words: [
      { id: 'vw10', target: 'Bola', imageUrl: '/assets/images/phonology/bola_ilustracao_1784079667038.png' },
      { id: 'vw11', target: 'Boneca', imageUrl: '/assets/images/vocabulary/boneca_ilustracao_1784133945043.png' },
      { id: 'vw12', target: 'Carrinho', imageUrl: '/assets/images/vocabulary/carrinho_ilustracao_1784133967899.png' }
    ],
  },
  {
    id: 'transportes',
    name: 'Transportes',
    icon: '🚗',
    words: [
      { id: 'vw13', target: 'Carro', imageUrl: '/assets/images/vocabulary/carro_ilustracao_1784133988739.png' },
      { id: 'vw14', target: 'Ônibus', imageUrl: '/assets/images/vocabulary/onibus_ilustracao_1784134011028.png' },
      { id: 'vw15', target: 'Avião', imageUrl: '/assets/images/vocabulary/aviao_ilustracao_1784134034335.png' }
    ],
  },
  {
    id: 'objetos',
    name: 'Objetos',
    icon: '📦',
    words: [
      { id: 'vw16', target: 'Mesa', imageUrl: '/assets/images/phonology/mesa_ilustracao_1784079740538.png' },
      { id: 'vw17', target: 'Cadeira', imageUrl: '/assets/images/vocabulary/cadeira_ilustracao_1784134055889.png' },
      { id: 'vw18', target: 'Cama', imageUrl: '/assets/images/vocabulary/cama_ilustracao_1784134077115.png' }
    ],
  },
  {
    id: 'roupas',
    name: 'Roupas',
    icon: '👕',
    words: [
      { id: 'vw19', target: 'Camisa', imageUrl: '/assets/images/vocabulary/camisa_ilustracao_1784134097782.png' },
      { id: 'vw20', target: 'Calça', imageUrl: '/assets/images/vocabulary/camisa_ilustracao_1784134097782.png' },
      { id: 'vw21', target: 'Sapato', imageUrl: '/assets/images/vocabulary/camisa_ilustracao_1784134097782.png' }
    ],
  },
  {
    id: 'verbos',
    name: 'Verbos',
    icon: '🏃',
    words: [
      { id: 'vw22', target: 'Comer', imageUrl: '/assets/images/vocabulary/maca_ilustracao_1784133837968.png' },
      { id: 'vw23', target: 'Beber', imageUrl: '/assets/images/vocabulary/banana_ilustracao_1784133814171.png' },
      { id: 'vw24', target: 'Dormir', imageUrl: '/assets/images/vocabulary/cama_ilustracao_1784134077115.png' }
    ],
  },
  {
    id: 'natureza',
    name: 'Natureza',
    icon: '🌳',
    words: [
      { id: 'vw25', target: 'Sol', imageUrl: '/assets/images/phonology/sol_ilustracao_1784079775745.png' },
      { id: 'vw26', target: 'Lua', imageUrl: '/assets/images/phonology/sol_ilustracao_1784079775745.png' },
      { id: 'vw27', target: 'Árvore', imageUrl: '/assets/images/phonology/casa_ilustracao_1784079675411.png' }
    ],
  },
  {
    id: 'escola',
    name: 'Escola',
    icon: '📚',
    words: [
      { id: 'vw28', target: 'Livro', imageUrl: '/assets/images/phonology/livro_ilustracao_1784079768845.png' },
      { id: 'vw29', target: 'Lápis', imageUrl: '/assets/images/phonology/livro_ilustracao_1784079768845.png' },
      { id: 'vw30', target: 'Caderno', imageUrl: '/assets/images/phonology/livro_ilustracao_1784079768845.png' }
    ],
  },
];

export const VOCABULARY_MODALITIES = [
  { id: 'expressive', name: 'Expressivo', description: 'Perguntar "O que é isso?" mostrando a figura' },
  { id: 'receptive', name: 'Receptivo', description: 'Pedir "Mostre onde está..." entre várias figuras' },
  { id: 'evocation', name: 'Evocação', description: 'Perguntar "O que você usa para...?" ou "O que faz..."' },
];

export const VOCABULARY_RESPONSE_TYPES = [
  { id: 'correct', label: 'Correta', color: 'var(--success-color)' },
  { id: 'semantic_substitution', label: 'Subst. Semântica', color: 'var(--warning-color)' },
  { id: 'phonological_substitution', label: 'Subst. Fonológica', color: '#f97316' },
  { id: 'circunlocution', label: 'Circunlóquio', color: '#a855f7' },
  { id: 'no_response', label: 'Sem resposta', color: 'var(--danger-color)' },
  { id: 'cue_used', label: 'Uso de pista', color: '#06b6d4' },
];
