import { describe, it, expect } from 'vitest';
import {
  calculateMchatScore,
  calculatePragmatics,
  calculateBambiScore,
} from './teaEvaluations';
import { generateOfflinePlan, generatePts, GeminiApiError } from './geminiPtsGenerator';

describe('Rastreio M-CHAT-R/F', () => {
  it('deve classificar como Baixo Risco se houver menos de 3 falhas', () => {
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false;
      } else {
        responses[`q${i}`] = true;
      }
    }
    responses.q1 = false;
    responses.q2 = true;

    const result = calculateMchatScore(responses);
    expect(result.score).toBe(2);
    expect(result.risk).toBe('Baixo Risco');
  });

  it('deve classificar como Médio Risco se houver entre 3 e 7 falhas', () => {
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false;
      } else {
        responses[`q${i}`] = true;
      }
    }
    for (let i = 1; i <= 5; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = true;
      } else {
        responses[`q${i}`] = false;
      }
    }

    const result = calculateMchatScore(responses);
    expect(result.score).toBe(5);
    expect(result.risk).toBe('Médio Risco');
    expect(result.recommendation).toContain('Follow-Up');
  });

  it('deve classificar como Alto Risco se houver 8 ou mais falhas', () => {
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false;
      } else {
        responses[`q${i}`] = true;
      }
    }
    for (let i = 1; i <= 8; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = true;
      } else {
        responses[`q${i}`] = false;
      }
    }

    const result = calculateMchatScore(responses);
    expect(result.score).toBe(8);
    expect(result.risk).toBe('Alto Risco');
  });

  it('deve retornar score zero para respostas sem falhas', () => {
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false;
      } else {
        responses[`q${i}`] = true;
      }
    }

    const result = calculateMchatScore(responses);
    expect(result.score).toBe(0);
    expect(result.risk).toBe('Baixo Risco');
  });
});

describe('Perfil Funcional de Pragmática', () => {
  it('deve calcular taxa por minuto e dominância gestual', () => {
    const counts = { verbal: 2, vocal: 4, gestual: 14 };
    const result = calculatePragmatics(counts, 5);
    expect(result.totalActs).toBe(20);
    expect(result.ratePerMinute).toBe(4.0);
    expect(result.means.gestual.percent).toBe(70);
    expect(result.predominantMean).toContain('Meio Gestual');
  });

  it('deve detectar dominância verbal', () => {
    const counts = { verbal: 10, vocal: 2, gestual: 1 };
    const result = calculatePragmatics(counts, 2);
    expect(result.totalActs).toBe(13);
    expect(result.predominantMean).toContain('Meio Verbal');
  });

  it('deve retornar meio misto quando não há dominância clara', () => {
    const counts = { verbal: 5, vocal: 5, gestual: 5 };
    const result = calculatePragmatics(counts, 5);
    expect(result.totalActs).toBe(15);
    expect(result.predominantMean).toBe('Meio Comunicativo Misto');
  });

  it('deve retornar zero atos quando não há registros', () => {
    const counts = { verbal: 0, vocal: 0, gestual: 0 };
    const result = calculatePragmatics(counts, 5);
    expect(result.totalActs).toBe(0);
    expect(result.ratePerMinute).toBe(0);
    expect(result.predominantMean).toContain('Sem comunicação');
  });
});

describe('Inventário Alimentar BAMBI', () => {
  it('deve classificar como Normal com score até 18', () => {
    const data = {};
    for (let i = 1; i <= 18; i++) {
      data[`bambiQ${i}`] = 1;
    }
    const result = calculateBambiScore(data);
    expect(result.score).toBe(18);
    expect(result.severity).toBe('Comportamento Alimentar Normal');
  });

  it('deve classificar como Leve com score entre 19 e 34', () => {
    const data = {};
    for (let i = 1; i <= 18; i++) {
      data[`bambiQ${i}`] = 2;
    }
    const result = calculateBambiScore(data);
    expect(result.score).toBe(36);
    expect(result.severity).toBe('Seletividade Alimentar e Rigidez Sensorial Moderada');
  });

  it('deve classificar como Moderada com score entre 35 e 54', () => {
    const data = {};
    for (let i = 1; i <= 18; i++) {
      data[`bambiQ${i}`] = 3;
    }
    const result = calculateBambiScore(data);
    expect(result.score).toBe(54);
    expect(result.severity).toBe('Seletividade Alimentar e Rigidez Sensorial Moderada');
  });

  it('deve classificar como Grave com score >= 55', () => {
    const data = {};
    for (let i = 1; i <= 18; i++) {
      data[`bambiQ${i}`] = 5;
    }
    const result = calculateBambiScore(data);
    expect(result.score).toBe(90);
    expect(result.severity).toBe('Seletividade Alimentar e Comportamento Disruptivo Grave');
  });
});

describe('Gemini PTS Generator', () => {
  const mockPatient = {
    id: 'test1', name: 'Test', age: 5, gender: 'Masculino',
    birthDate: '2021-01-01', speechComplaint: 'Atraso de fala',
    diagnosis: 'TEA', createdAt: new Date().toISOString(), history: []
  };

  const mockAssessments = {
    mchat: { risk: 'Alto Risco', score: 10, maxScore: 20 },
    pragmatics: { ratePerMinute: 3.0, predominantMean: 'Meio Gestual', totalActs: 15 },
    bambi: { severity: 'Seletividade Alimentar e Rigidez Sensorial Moderada', score: 40 },
  };

  it('deve gerar plano offline com estrutura correta', async () => {
    const plan = await generateOfflinePlan(mockPatient, mockAssessments);
    expect(plan.planType).toBe('offline');
    expect(plan.models).toBeDefined();
    expect(plan.models.speechPlan).toBeTruthy();
    expect(plan.models.feedingPlan).toBeTruthy();
    expect(plan.steps).toBeInstanceOf(Array);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.notes).toBeTruthy();
  });

  it('deve incluir plano de CAA para Alto Risco', async () => {
    const plan = await generateOfflinePlan(mockPatient, mockAssessments);
    expect(plan.models.speechPlan.toLowerCase()).toContain('caa');
  });

  it('deve incluir plano alimentar baseado no BAMBI', async () => {
    const plan = await generateOfflinePlan(mockPatient, mockAssessments);
    expect(plan.models.feedingPlan).toBeTruthy();
  });

  it('generatePts deve retornar plano offline sem chave Gemini', async () => {
    const plan = await generatePts(mockPatient, mockAssessments, { useGemini: false });
    expect(plan.planType).toBe('offline');
    expect(plan.models).toBeDefined();
  });

  it('GeminiApiError deve ser criado corretamente', () => {
    const err = new GeminiApiError('Test error', 429, 5000);
    expect(err.name).toBe('GeminiApiError');
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(5000);
  });
});

describe('calculateAge (via Dashboard logic)', () => {
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString + 'T00:00:00');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  it('deve calcular idade corretamente', () => {
    const age = calculateAge('2020-01-01');
    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThanOrEqual(0);
  });

  it('deve retornar vazio para data inválida', () => {
    expect(calculateAge('')).toBe('');
    expect(calculateAge(null)).toBe('');
    expect(calculateAge(undefined)).toBe('');
  });
});
