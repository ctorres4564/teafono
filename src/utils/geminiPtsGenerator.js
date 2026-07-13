// Gemini API utilities for TeaFono
import { auth } from '../firebase';

export class GeminiApiError extends Error {
  constructor(message, status, retryAfter) {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function generateOfflinePlan(patient, assessments) {
  let speechPlan = '';
  if (assessments.mchat?.risk === 'Alto Risco') {
    speechPlan = 'Planejamento estruturado para estimular a intenção comunicativa: Uso de Prancha de Comunicação Alternativa (CAA) com Modelo Denver de Modelagem de Fala, sessões intensivas de 15 minutos 3x/semana. Agentes geradores de fala: Modelagem de pacotes de fala interoceptiva por modelos adultos. Recompensas condicionadas: Selos de sucesso de ativação de desejo, jogo interativo. Instruções de reforço para cuidadores: Usar janelas de oportunidade comunicativa que antecedem necessidades.';
  } else if (assessments.pragmatics?.ratePerMinute <= 4) {
    speechPlan = 'Planejamento para aumentar a frequência de atos comunicativos: Técnicas de densidade de contingência (GAC - Contingência por Antecedente Decisivo), Tempo real graphograma de resposta por conduta que modela duração de ocorrência de semântica, Instrumentalidade de Dinâmica de Distribuição de Reforço por Fatores Materiais, Sessão de Abstração de Resposta por Ação de Elogio';
  } else {
    speechPlan = 'Manutenção de habilidades comunicativas: Jogos de conversação pragmática com foco em representação e transição para ações comunicativas múltiplas, incentivo gradual de declarativas de estado físico';
  }

  let feedingPlan = '';
  if (assessments.bambi?.severity?.includes('Leve')) {
    feedingPlan = 'Extensão sensorial de textura; exposição gradual e graduada: bolo gatinho enrolado, massa para bolinhas, normalizar aromas de chiclete (mente, limão)';
  } else if (assessments.bambi?.severity?.includes('Moderada')) {
    feedingPlan = 'Intervenção multissensorial sem nilha (IO tan) analítica por espessura; amplificação de contingência com ferramentas sensorias macro, kit de abertura de boca com mordida (masseter/temporal da máxila)';
  } else {
    feedingPlan = 'Abordagem intensiviva, reabilitação orofacial, instrumentalizada (Beckman), fonoaudiólogo especialista em disfagia, usar enfrentamento ao TIC (funcional); suturas em Tmap';
  }

  return {
    planType: 'offline',
    generatedAt: new Date().toISOString(),
    models: {
      speechPlan,
      feedingPlan
    },
    steps: [
      'Avaliação das preferências comunicativas',
      'Iniciar com pequenos atos de desejo (15-20 minutos)',
      'Combinar e dimensionar estratégias motivacionais',
      'Transferir de conjuntos de instruções controladas para contextos naturais',
    ],
    notes: 'Todas as estratégias devem ser validadas clinicamente por um fonoaudiólogo especialista em TEA.'
  };
}

export async function callGeminiApi(patient, assessments) {
  try {
    if (!auth?.currentUser) {
      throw new GeminiApiError('É necessário estar autenticado para usar o PTS com IA', 401);
    }
    const idToken = await auth.currentUser.getIdToken();

    const response = await fetch('/api/generate-pts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ patient, assessments })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new GeminiApiError(
        body.error || 'Erro na chamada da API',
        response.status,
        body.retryAfter
      );
    }

    return await response.json();

  } catch (error) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    console.error('Erro na chamada da API Gemini:', error);
    throw new GeminiApiError('Falha interna da API', 500);
  }
}

export async function generatePts(patient, assessments, options = { useGemini: false }) {
  if (options.useGemini) {
    try {
      return await callGeminiApi(patient, assessments);
    } catch (error) {
      console.error('Erro ao usar Gemini, usando plano offline:', error);
    }
  }

  return await generateOfflinePlan(patient, assessments);
}