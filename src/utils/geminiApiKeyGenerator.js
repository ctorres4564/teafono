// Gemini API utilities for TeaFono
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

export async function callGeminiApi(patient, assessments, apiKey) {
  const prompt = `Você é uma fonoaudióloga especialista em TEA com vasta experiência clínica em plano de intervenção fonoaudiológica personalizado para autismo. Crie um plano de intervenção personalizado e detalhado baseado nos dados abaixo:

**Dados do Paciente:**
- Nome: ${patient.name}
- Idade: ${patient.age} anos
- Data de Nascimento: ${patient.birthDate}
- Gênero: ${patient.gender}
- Queixa Fonoaudiológica: ${patient.speechComplaint}

**Resultados das Avaliações:**
- M-CHAT-R/F Risco: ${assessments.mchat?.risk}
- Perfil Pragmático: ${assessments.pragmatics?.ratePerMinute} atos/min, dominante: ${assessments.pragmatics?.predominantMean}
- Seletividade Alimentar: ${assessments.bambi?.severity}

**Tarefas:**
1. Forneça um plano de intervenção fonoaudiológica personalizado com objetivos específicos, frequência e técnicas
2. Ofereça estratégias motoras orais específicas para habilidades de fala 
3. Inclua diretrizes de manejo alimentar específicas
4. Forneça uma lista de verificação de marcos de acompanhamento

Formate a saída como JSON com os seguintes campos: "planoDeIntervencao" (texto), "objetivos" (array), "frequencia" (texto), "tecnicas" (array), "habilidadesOrais" (texto), "estrategiasAlimentares" (texto), "acompanhamento" (array).`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      let errorMessage = 'Erro na chamada da API';
      let retryAfter = undefined;

      if (response.status === 429) {
        errorMessage = 'Limite de taxa excedido';
        retryAfter = 5000;
      } else if (response.status === 503) {
        errorMessage = 'Serviço temporariamente indisponível';
        retryAfter = 15000;
      }

      throw new GeminiApiError(errorMessage, response.status, retryAfter);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new GeminiApiError('Resposta inválida da IA', 500);
    }

    const jsonMatch = text.match(/\{[^]*\}/g);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    }

    const descriptionMatch = text.match(/"planoDeIntervencao"[^\s]+\[/g);
    if (descriptionMatch) {
      const objStr = descriptionMatch.join('').replace(/"\s*[^\s]*\[/g, ' ').replace(/]/g, ']').replace(/,/g, ',');
      return JSON.parse(objStr);
    }

    throw new GeminiApiError('Formato de resposta inesperado', 500);

  } catch (error) {
    if (error instanceof GeminiApiError) {
      throw error;
    }

    console.error('Erro na chamada da API Gemini:', error);
    throw new GeminiApiError('Falha interna da API', 500);
  }
}

export async function generatePts(patient, assessments, options = { useGemini: false }) {
  if (options.useGemini && import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      return await callGeminiApi(patient, assessments, import.meta.env.VITE_GEMINI_API_KEY);
    } catch (error) {
      console.error('Erro ao usar Gemini, usando plano offline:', error);
    }
  }

  return await generateOfflinePlan(patient, assessments);
}