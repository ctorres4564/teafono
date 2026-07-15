export const PHONOLOGY_WORDS = [
  { id: 'pw1', target: 'Bola', transcription: '', observations: '', imageUrl: '/assets/images/phonology/bola_ilustracao_1784079667038.png' },
  { id: 'pw2', target: 'Casa', transcription: '', observations: '', imageUrl: '/assets/images/phonology/casa_ilustracao_1784079675411.png' },
  { id: 'pw3', target: 'Dedo', transcription: '', observations: '', imageUrl: '/assets/images/phonology/dedo_ilustracao_1784079682140.png' },
  { id: 'pw4', target: 'Faca', transcription: '', observations: '', imageUrl: '/assets/images/phonology/faca_ilustracao_1784079689062.png' },
  { id: 'pw5', target: 'Gato', transcription: '', observations: '', imageUrl: '/assets/images/phonology/gato_ilustracao_1784079695633.png' },
  { id: 'pw6', target: 'Pato', transcription: '', observations: '', imageUrl: '/assets/images/phonology/pato_ilustracao_1784079712708.png' },
  { id: 'pw7', target: 'Sapo', transcription: '', observations: '', imageUrl: '/assets/images/phonology/sapo_ilustracao_1784079719696.png' },
  { id: 'pw8', target: 'Tatu', transcription: '', observations: '', imageUrl: '/assets/images/phonology/tatu_ilustracao_1784079726811.png' },
  { id: 'pw9', target: 'Vaca', transcription: '', observations: '', imageUrl: '/assets/images/phonology/vaca_ilustracao_1784079733650.png' },
  { id: 'pw10', target: 'Mesa', transcription: '', observations: '', imageUrl: '/assets/images/phonology/mesa_ilustracao_1784079740538.png' },
  { id: 'pw11', target: 'Nuvem', transcription: '', observations: '', imageUrl: '/assets/images/phonology/nuvem_ilustracao_1784079760599.png' },
  { id: 'pw12', target: 'Livro', transcription: '', observations: '', imageUrl: '/assets/images/phonology/livro_ilustracao_1784079768845.png' },
  { id: 'pw13', target: 'Sol', transcription: '', observations: '', imageUrl: '/assets/images/phonology/sol_ilustracao_1784079775745.png' },
  { id: 'pw14', target: 'Chave', transcription: '', observations: '', imageUrl: '/assets/images/phonology/chave_ilustracao_1784079782891.png' },
  { id: 'pw15', target: 'Fogo', transcription: '', observations: '', imageUrl: '/assets/images/phonology/fogo_ilustracao_1784079794009.png' },
  { id: 'pw16', target: 'Rato', transcription: '', observations: '', imageUrl: '/assets/images/phonology/rato_ilustracao_1784079813325.png' },
  { id: 'pw17', target: 'Peixe', transcription: '', observations: '', imageUrl: '/assets/images/phonology/peixe_ilustracao_1784079822798.png' },
  { id: 'pw18', target: 'Cachorro', transcription: '', observations: '', imageUrl: '/assets/images/phonology/cachorro_ilustracao_1784132950201.png' },
  { id: 'pw19', target: 'Girafa', transcription: '', observations: '', imageUrl: '/assets/images/phonology/girafa_ilustracao_1784132975819.png' },
  { id: 'pw20', target: 'Telefone', transcription: '', observations: '', imageUrl: '/assets/images/phonology/telefone_ilustracao_1784133001590.png' },
];

export const PHONOLOGY_CONSONANTS = [
  { id: 'pc1', symbol: '/p/', name: 'Plosivo bilabial surdo', examples: 'pato, capa' },
  { id: 'pc2', symbol: '/b/', name: 'Plosivo bilabial sonoro', examples: 'bola, caba' },
  { id: 'pc3', symbol: '/t/', name: 'Plosivo alveolar surdo', examples: 'tatu, gato' },
  { id: 'pc4', symbol: '/d/', name: 'Plosivo alveolar sonoro', examples: 'dedo, cada' },
  { id: 'pc5', symbol: '/k/', name: 'Plosivo velar surdo', examples: 'casa, macaco' },
  { id: 'pc6', symbol: '/g/', name: 'Plosivo velar sonoro', examples: 'gato, fogo' },
  { id: 'pc7', symbol: '/f/', name: 'Fricativo labiodental surdo', examples: 'faca, café' },
  { id: 'pc8', symbol: '/v/', name: 'Fricativo labiodental sonoro', examples: 'vaca, ovo' },
  { id: 'pc9', symbol: '/s/', name: 'Fricativo alveolar surdo', examples: 'sapo, casa' },
  { id: 'pc10', symbol: '/z/', name: 'Fricativo alveolar sonoro', examples: 'zebra, mesa' },
  { id: 'pc11', symbol: '/ʃ/', name: 'Fricativo palato-alveolar surdo', examples: 'chave, peixe' },
  { id: 'pc12', symbol: '/ʒ/', name: 'Fricativo palato-alveolar sonoro', examples: 'gelo, jipe' },
  { id: 'pc13', symbol: '/m/', name: 'Nasal bilabial', examples: 'mamãe, cama' },
  { id: 'pc14', symbol: '/n/', name: 'Nasal alveolar', examples: 'nuvem, cana' },
  { id: 'pc15', symbol: '/ɲ/', name: 'Nasal palatal', examples: 'banho, ninho' },
  { id: 'pc16', symbol: '/l/', name: 'Lateral alveolar', examples: 'lua, bola' },
  { id: 'pc17', symbol: '/ʎ/', name: 'Lateral palatal', examples: 'palha, olho' },
  { id: 'pc18', symbol: '/ɾ/', name: 'Tepe alveolar', examples: 'caro, prato' },
  { id: 'pc19', symbol: '/ʁ/', name: 'Fricativo glotal/velar', examples: 'rato, carro' },
];

export function calculatePCCR(productions) {
  let correct = 0;
  let total = 0;

  (productions || []).forEach(p => {
    if (!p.consoants) return;
    Object.values(p.consoants).forEach(prod => {
      total++;
      if (prod === 'correct') correct++;
    });
  });

  if (total === 0) return { correct, total, percentage: 0, classification: 'Sem dados' };

  const percentage = Math.round((correct / total) * 100);
  let classification = '';
  if (percentage >= 90) classification = 'Dentro do esperado para a idade';
  else if (percentage >= 70) classification = 'Leve alteração fonológica';
  else if (percentage >= 50) classification = 'Moderada alteração fonológica';
  else classification = 'Grave alteração fonológica';

  return { correct, total, percentage, classification };
}
