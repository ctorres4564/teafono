import { ASSESSMENT_TYPES } from './assessmentModel';

const assessmentRegistry = {
  [ASSESSMENT_TYPES.PRAGMATICS]: {
    id: ASSESSMENT_TYPES.PRAGMATICS,
    name: 'Perfil Funcional de Pragmática (Fernandes)',
    shortName: 'Pragmática',
    icon: 'MessageSquare',
    color: '#8b5cf6',
    route: '/pragmatics',
    description: 'Avaliação dos meios comunicativos verbais, vocais e gestuais',
  },
  [ASSESSMENT_TYPES.MCHAT]: {
    id: ASSESSMENT_TYPES.MCHAT,
    name: 'Triagem de Sinais Precoces (M-CHAT-R/F)',
    shortName: 'M-CHAT',
    icon: 'ClipboardCheck',
    color: '#3b82f6',
    route: '/mchat',
    description: 'Rastreio de sinais precoces de autismo para crianças de 16-30 meses',
  },
  [ASSESSMENT_TYPES.BAMBI]: {
    id: ASSESSMENT_TYPES.BAMBI,
    name: 'Seletividade Alimentar e Sensorial (BAMBI)',
    shortName: 'BAMBI',
    icon: 'Apple',
    color: '#06b6d4',
    route: '/bambi',
    description: 'Inventário de comportamento alimentar no autismo',
  },
  [ASSESSMENT_TYPES.VOCABULARY]: {
    id: ASSESSMENT_TYPES.VOCABULARY,
    name: 'Avaliação de Vocabulário',
    shortName: 'Vocabulário',
    icon: 'BookOpen',
    color: '#f59e0b',
    route: '/vocabulary',
    description: 'Avaliação de vocabulário expressivo, receptivo e por evocação',
  },
  [ASSESSMENT_TYPES.FLUENCY_VERBAL]: {
    id: ASSESSMENT_TYPES.FLUENCY_VERBAL,
    name: 'Fluência Verbal',
    shortName: 'Fluência Verbal',
    icon: 'MessageCircle',
    color: '#10b981',
    route: '/fluency-verbal',
    description: 'Avaliação da fluência verbal com contagem de palavras',
  },
  [ASSESSMENT_TYPES.FLUENCY_SPEECH]: {
    id: ASSESSMENT_TYPES.FLUENCY_SPEECH,
    name: 'Fluência da Fala',
    shortName: 'Fluência da Fala',
    icon: 'Mic',
    color: '#14b8a6',
    route: '/fluency-speech',
    description: 'Avaliação das descontinuidades da fala',
  },
  [ASSESSMENT_TYPES.PHONOLOGY]: {
    id: ASSESSMENT_TYPES.PHONOLOGY,
    name: 'Avaliação Fonológica',
    shortName: 'Fonologia',
    icon: 'Languages',
    color: '#ec4899',
    route: '/phonology',
    description: 'Avaliação fonológica com cálculo do PCC-R',
  },
};

export function getAssessmentMeta(type) {
  return assessmentRegistry[type] || null;
}

export function getAllAssessmentMetas() {
  return Object.values(assessmentRegistry);
}

export default assessmentRegistry;
