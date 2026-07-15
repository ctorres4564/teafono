import { describe, it, expect } from 'vitest';
import { generateOfflinePlan } from './geminiPtsGenerator';

describe('Geração de Plano Offline (IA Offline) — Diferentes Perfis de Pacientes', () => {
  const basePatient = { id: 'patient_test', name: 'Joãozinho', age: 4, gender: 'Masculino' };

  it('Perfil 1: Alto risco de TEA, baixa frequência de atos comunicativos e seletividade severa', async () => {
    const assessments = {
      mchat: { risk: 'Alto Risco' },
      pragmatics: { ratePerMinute: 2 },
      bambi: { severity: 'Severa' }
    };

    const plan = await generateOfflinePlan(basePatient, assessments);

    expect(plan.planType).toBe('offline');
    // Deve aplicar plano estruturadoDenver/CAA por causa do Alto Risco do M-CHAT (toma precedência sobre pragmatics <= 4 na condicional)
    expect(plan.models.speechPlan).toContain('Denver');
    expect(plan.models.speechPlan).toContain('CAA');
    // Deve aplicar reabilitação Beckman por ser seletividade severa/outros
    expect(plan.models.feedingPlan).toContain('Beckman');
    expect(plan.models.feedingPlan).toContain('disfagia');
  });

  it('Perfil 2: Baixo risco de TEA, baixa frequência de atos comunicativos e seletividade leve', async () => {
    const assessments = {
      mchat: { risk: 'Baixo Risco' },
      pragmatics: { ratePerMinute: 3 }, // <= 4
      bambi: { severity: 'Leve' }
    };

    const plan = await generateOfflinePlan(basePatient, assessments);

    expect(plan.planType).toBe('offline');
    // Deve aplicar técnicas GAC de contingência por causa de atos comunicativos <= 4 e M-CHAT não ser Alto Risco
    expect(plan.models.speechPlan).toContain('GAC');
    expect(plan.models.speechPlan).toContain('densidade de contingência');
    // Deve sugerir exposição gradual de textura por ser seletividade leve
    expect(plan.models.feedingPlan).toContain('bolo gatinho');
    expect(plan.models.feedingPlan).toContain('textura');
  });

  it('Perfil 3: Baixo risco de TEA, boa frequência de atos comunicativos e seletividade moderada', async () => {
    const assessments = {
      mchat: { risk: 'Baixo Risco' },
      pragmatics: { ratePerMinute: 6 }, // > 4
      bambi: { severity: 'Moderada' }
    };

    const plan = await generateOfflinePlan(basePatient, assessments);

    expect(plan.planType).toBe('offline');
    // Deve sugerir manutenção de habilidades comunicativas com foco em conversação pragmática
    expect(plan.models.speechPlan).toContain('Manutenção de habilidades');
    expect(plan.models.speechPlan).toContain('Jogos de conversação');
    // Deve focar em intervenção multissensorial e kit de mordida por ser seletividade moderada
    expect(plan.models.feedingPlan).toContain('multissensorial');
    expect(plan.models.feedingPlan).toContain('kit de abertura de boca');
  });

  it('Perfil 4: Alto risco de TEA, boa frequência de atos comunicativos e seletividade moderada', async () => {
    const assessments = {
      mchat: { risk: 'Alto Risco' },
      pragmatics: { ratePerMinute: 7 }, // > 4
      bambi: { severity: 'Moderada' }
    };

    const plan = await generateOfflinePlan(basePatient, assessments);

    expect(plan.planType).toBe('offline');
    // Deve manter Denver/CAA devido ao M-CHAT Alto Risco
    expect(plan.models.speechPlan).toContain('Denver');
    expect(plan.models.speechPlan).toContain('CAA');
    // Seletividade moderada
    expect(plan.models.feedingPlan).toContain('kit de abertura de boca');
  });
});
