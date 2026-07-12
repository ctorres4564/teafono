export const VOCABULARY_CATEGORIES = [
  {
    id: 'animais',
    name: 'Animais',
    icon: '🐾',
    words: ['Cachorro', 'Gato', 'Vaca', 'Cavalo', 'Galinha', 'Pato', 'Peixe', 'Elefante', 'Leão', 'Macaco'],
  },
  {
    id: 'alimentos',
    name: 'Alimentos',
    icon: '🍎',
    words: ['Arroz', 'Feijão', 'Pão', 'Leite', 'Banana', 'Maçã', 'Biscoito', 'Suco', 'Sorvete', 'Bolo'],
  },
  {
    id: 'profissoes',
    name: 'Profissões',
    icon: '👨‍⚕️',
    words: ['Médico', 'Professor', 'Bombeiro', 'Policial', 'Cozinheiro', 'Motorista', 'Cantor', 'Pintor', 'Jardineiro', 'Veterinário'],
  },
  {
    id: 'brinquedos',
    name: 'Brinquedos',
    icon: '🧸',
    words: ['Bola', 'Boneca', 'Carrinho', 'Pipa', 'Bicicleta', 'Peteca', 'Bambolê', 'Quebra-cabeça', 'Balanço', 'Bolinha de sabão'],
  },
  {
    id: 'transportes',
    name: 'Transportes',
    icon: '🚗',
    words: ['Carro', 'Ônibus', 'Avião', 'Barco', 'Moto', 'Caminhão', 'Trem', 'Bicicleta', 'Helicóptero', 'Navio'],
  },
  {
    id: 'objetos',
    name: 'Objetos',
    icon: '📦',
    words: ['Mesa', 'Cadeira', 'Cama', 'Porta', 'Janela', 'Lápis', 'Tesoura', 'Chave', 'Relógio', 'Chapéu'],
  },
  {
    id: 'roupas',
    name: 'Roupas',
    icon: '👕',
    words: ['Camisa', 'Calça', 'Sapato', 'Meia', 'Vestido', 'Short', 'Casaco', 'Boné', 'Cinto', 'Pijama'],
  },
  {
    id: 'verbos',
    name: 'Verbos',
    icon: '🏃',
    words: ['Comer', 'Beber', 'Dormir', 'Correr', 'Pular', 'Nadar', 'Cantar', 'Dançar', 'Ler', 'Escrever'],
  },
  {
    id: 'natureza',
    name: 'Natureza',
    icon: '🌳',
    words: ['Sol', 'Lua', 'Estrela', 'Árvore', 'Flor', 'Rio', 'Mar', 'Montanha', 'Chuva', 'Vento'],
  },
  {
    id: 'escola',
    name: 'Escola',
    icon: '📚',
    words: ['Escola', 'Lápis', 'Livro', 'Caderno', 'Mochila', 'Giz', 'Borracha', 'Régua', 'Apontador', 'Estojo'],
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
