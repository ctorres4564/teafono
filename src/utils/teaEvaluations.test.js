import { describe, it, expect } from 'vitest';
import {
  calculateMchatScore,
  calculatePragmatics,
  calculateBambiScore
} from './teaEvaluations';

describe('Rastreio M-CHAT-R/F (Sinais Precoces de Autismo)', () => {
  it('deve classificar como Baixo Risco se houver menos de 3 falhas de desenvolvimento', () => {
    // Inicializa com respostas sem falhas (SIM para q1, NÃO para q2, etc.)
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false; // SIM é falha, então false é normal
      } else {
        responses[`q${i}`] = true;  // NÃO é falha, então true é normal
      }
    }
    // Adiciona 2 falhas
    responses.q1 = false; // falha
    responses.q2 = true;  // falha

    const result = calculateMchatScore(responses);
    expect(result.score).toBe(2);
    expect(result.risk).toBe('Baixo Risco');
  });

  it('deve classificar como Alto Risco se houver 8 ou mais falhas de desenvolvimento', () => {
    const responses = {};
    for (let i = 1; i <= 20; i++) {
      if ([2, 5, 12].includes(i)) {
        responses[`q${i}`] = false;
      } else {
        responses[`q${i}`] = true;
      }
    }
    // Adiciona 8 falhas
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
});

describe('Perfil Funcional de Pragmática (PAHPEA)', () => {
  it('deve calcular corretamente a taxa por minuto e a dominância de meios não-verbais (gestuais)', () => {
    const counts = {
      verbal: 2,
      vocal: 4,
      gestual: 14 // total 20 atos
    };
    const result = calculatePragmatics(counts, 5); // 5 minutos
    expect(result.totalActs).toBe(20);
    expect(result.ratePerMinute).toBe(4.0); // 20 / 5
    expect(result.means.gestual.percent).toBe(70);
    expect(result.predominantMean).toContain('Meio Gestual - Não-Verbal');
  });
});

describe('Inventário Alimentar BAMBI (Seletividade Alimentar e Sensorial)', () => {
  it('deve calcular a pontuação acumulada e classificar a gravidade', () => {
    const data = {};
    for (let i = 1; i <= 18; i++) {
      data[`bambiQ${i}`] = 3; // Média neutra de comportamento
    }
    // 18 * 3 = 54 pontos -> Moderada (faixa 35-54)
    const result = calculateBambiScore(data);
    expect(result.score).toBe(54);
    expect(result.severity).toBe('Seletividade Alimentar e Rigidez Sensorial Moderada');
  });
});
