// Mock inicial de crianças com histórico de avaliações de autismo
export const mockTeaPatients = [
  {
    id: "tp1",
    name: "Arthur de Almeida Rezende",
    age: 4,
    gender: "Masculino",
    diagnosis: "TEA Nível 2 de Suporte / Apraxia de Fala Infantil Suspeita",
    birthDate: "2022-03-15",
    speechComplaint: "Atraso na fala, suspeita de apraxia de fala infantil e baixa intencionalidade comunicativa.",
    createdAt: "2026-06-20T10:00:00.000Z",
    history: [
      {
        id: "teval_1",
        date: "2026-06-20T11:00:00.000Z",
        results: {
          mchat: { score: 9, risk: "Alto Risco", recommendation: "Encaminhar imediatamente para avaliação diagnóstica especializada formal com equipe multidisciplinar (Neuropediatra/Psiquiatra Infantil, Fonoaudiólogo, Psicólogo)." },
          pragmatics: {
            totalActs: 18,
            durationMin: 5,
            ratePerMinute: 3.6,
            means: {
              verbal: { count: 2, percent: 11 },
              vocal: { count: 4, percent: 22 },
              gestual: { count: 12, percent: 67 }
            },
            predominantMean: "Meio Gestual (Não-Verbal)"
          },
          bambi: { score: 45, maxScore: 90, severity: "Seletividade Alimentar Moderada" }
        }
      }
    ]
  },
  {
    id: "tp2",
    name: "Laura Viana Mendes",
    age: 2,
    gender: "Feminino",
    diagnosis: "Atraso no Desenvolvimento de Linguagem (Investigação de TEA)",
    birthDate: "2024-05-10",
    speechComplaint: "Atraso no desenvolvimento global de linguagem, pouco contato visual e ausência de fala intencional.",
    createdAt: "2026-06-25T14:30:00.000Z",
    history: []
  }
];

/**
 * Lógica do Protocolo M-CHAT-R/F (Modified Checklist for Autism in Toddlers)
 * @param {Object} responses { q1, q2, ..., q20 } - valores 0 (não pontua) ou 1 (pontua falha)
 * q2, q5, q12 têm resposta "SIM" como falha (pontuam 1).
 * Todas as outras q1, q3, q4, q6, q7, q8, q9, q10, q11, q13, q14, q15, q16, q17, q18, q19, q20 têm "NÃO" como falha (pontuam 1).
 */
export const calculateMchatScore = (responses) => {
  let score = 0;

  // Perguntas onde "NÃO" (false) representa falha de desenvolvimento (soma 1 ponto)
  const negativeFailQuestions = [1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
  // Perguntas onde "SIM" (true) representa falha de desenvolvimento (soma 1 ponto)
  const positiveFailQuestions = [2, 5, 12];

  negativeFailQuestions.forEach(qNum => {
    const val = responses[`q${qNum}`];
    if (val === false) {
      score += 1;
    }
  });

  positiveFailQuestions.forEach(qNum => {
    const val = responses[`q${qNum}`];
    if (val === true) {
      score += 1;
    }
  });

  let risk = "";
  let recommendation = "";

  if (score >= 8) {
    risk = "Alto Risco";
    recommendation = "Encaminhar imediatamente para avaliação diagnóstica especializada formal com equipe multidisciplinar (Neuropediatra/Psiquiatra Infantil, Fonoaudiólogo, Psicólogo) e intervenção precoce.";
  } else if (score >= 3) {
    risk = "Médio Risco";
    recommendation = "Aplicar a Entrevista de Seguimento (M-CHAT-R/F Follow-Up) para obter mais detalhes sobre as respostas com pontuação de risco. Se persistir score >= 3, encaminhar para avaliação.";
  } else {
    risk = "Baixo Risco";
    recommendation = "Nenhuma ação clínica de risco para autismo necessária no momento. Continuar acompanhamento do desenvolvimento de rotina infantil.";
  }

  return {
    score,
    maxScore: 20,
    risk,
    recommendation
  };
};

/**
 * Lógica do Perfil Funcional da Comunicação / Pragmática
 * @param {Object} counts { verbal, vocal, gestual, acts }
 * @param {Number} durationMin
 */
export const calculatePragmatics = (counts, durationMin = 5) => {
  const verbalCount = Number(counts.verbal || 0);
  const vocalCount = Number(counts.vocal || 0);
  const gestualCount = Number(counts.gestual || 0);

  const totalActs = verbalCount + vocalCount + gestualCount;
  const ratePerMinute = totalActs > 0 ? Number((totalActs / durationMin).toFixed(1)) : 0;

  let verbalPercent = 0;
  let vocalPercent = 0;
  let gestualPercent = 0;

  if (totalActs > 0) {
    verbalPercent = Math.round((verbalCount / totalActs) * 100);
    vocalPercent = Math.round((vocalCount / totalActs) * 100);
    gestualPercent = Math.round((gestualCount / totalActs) * 100);
  }

  let predominantMean = "Sem comunicação ativa registrada";
  if (totalActs > 0) {
    if (verbalPercent > vocalPercent && verbalPercent > gestualPercent) {
      predominantMean = `Meio Verbal (${verbalPercent}%)`;
    } else if (vocalPercent > verbalPercent && vocalPercent > gestualPercent) {
      predominantMean = `Meio Vocal (${vocalPercent}%)`;
    } else if (gestualPercent > verbalPercent && gestualPercent > vocalPercent) {
      predominantMean = `Meio Gestual - Não-Verbal (${gestualPercent}%)`;
    } else {
      predominantMean = "Meio Comunicativo Misto";
    }
  }

  return {
    totalActs,
    durationMin,
    ratePerMinute,
    means: {
      verbal: { count: verbalCount, percent: verbalPercent },
      vocal: { count: vocalCount, percent: vocalPercent },
      gestual: { count: gestualCount, percent: gestualPercent }
    },
    predominantMean
  };
};

/**
 * Lógica do BAMBI (Brief Autism Mealtime Behavior Inventory)
 * BAMBI avalia seletividade e comportamento alimentar com 18 questões (cada uma de 1 a 5 pontos)
 * Total max 90 pontos.
 */
export const calculateBambiScore = (data) => {
  const scoresList = Object.keys(data)
    .filter(key => key.startsWith('bambiQ'))
    .map(key => Number(data[key] || 1));

  const totalScore = scoresList.reduce((acc, curr) => acc + curr, 0);
  const maxScore = 90;

  let severity = "Comportamento Alimentar Normal";
  if (totalScore >= 55) {
    severity = "Seletividade Alimentar e Comportamento Disruptivo Grave";
  } else if (totalScore >= 35) {
    severity = "Seletividade Alimentar e Rigidez Sensorial Moderada";
  } else if (totalScore > 18) {
    severity = "Seletividade Alimentar Leve";
  }

  return {
    score: totalScore,
    maxScore,
    severity
  };
};
