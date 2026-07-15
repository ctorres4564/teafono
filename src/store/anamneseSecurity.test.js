import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock o Firebase e dependências externas para focar nos testes do store
vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'auth-user-123' },
  },
  isFirebaseEnabled: () => true,
  savePatientToFirestore: vi.fn().mockResolvedValue({ success: true }),
}));

import useStore from './useStore';
import { sanitizeText, sanitizeObject } from '../utils/securityUtils';

describe('Validação de Segurança e Sanitização da Anamnese', () => {
  beforeEach(() => {
    // Limpa o store e prepara dados de teste
    useStore.setState({
      patients: [
        {
          id: 'patient-xss-test',
          name: 'Criança Teste XSS',
          age: 5,
          gender: 'Masculino',
          history: [],
        }
      ],
      activePatientId: 'patient-xss-test',
      currentUser: { uid: 'auth-user-123' }
    });
  });

  it('sanitizeText deve limpar tags HTML e scripts maliciosos (anti-XSS)', () => {
    const malicious = "<script>alert('hack')</script>Texto <b>Seguro</b> <img src='x' onerror='alert(1)'>";
    const sanitized = sanitizeText(malicious);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toBe('Texto Seguro');
  });

  it('sanitizeObject deve limpar recursivamente propriedades de string em objetos', () => {
    const maliciousForm = {
      identification: {
        name: "João <script>alert(1)</script>",
        phone: "11999999999 <img src='x' onload='hack()'>"
      },
      mainComplaint: {
        firstWordsAge: "12",
        babbling: "sim <a href='javascript:alert(2)'>link</a>"
      }
    };

    const sanitized = sanitizeObject(maliciousForm);

    expect(sanitized.identification.name).toBe("João");
    expect(sanitized.identification.phone).toBe("11999999999");
    expect(sanitized.mainComplaint.babbling).toBe("sim link");
  });

  it('saveAssessmentResults deve rejeitar anamnese com telefone inválido (limite de dígitos)', async () => {
    const invalidForm = {
      identification: {
        name: "Luiz",
        phone: "1234567890123456789", // Muito longo (> 15 dígitos)
        birthDate: "2020-01-01"
      }
    };

    const result = await useStore.getState().saveAssessmentResults('anamnese', invalidForm, null, 'patient-xss-test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('telefone inválido');
  });

  it('saveAssessmentResults deve rejeitar anamnese com data de nascimento futura', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const invalidForm = {
      identification: {
        name: "Luiz",
        phone: "11988888888",
        birthDate: tomorrowStr // Data futura
      }
    };

    const result = await useStore.getState().saveAssessmentResults('anamnese', invalidForm, null, 'patient-xss-test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('data de nascimento não pode ser no futuro');
  });

  it('saveAssessmentResults deve sanitizar e salvar anamnese com sucesso caso passe nas validações', async () => {
    const validMaliciousForm = {
      identification: {
        name: "Pedro <script>XSS</script>",
        phone: "11988888888",
        birthDate: "2021-05-15"
      },
      mainComplaint: {
        firstWordsAge: "18 meses <iframe src='hack'></iframe>"
      }
    };

    const result = await useStore.getState().saveAssessmentResults('anamnese', validMaliciousForm, null, 'patient-xss-test');

    expect(result.success).toBe(true);
    expect(result.entryId).toBeDefined();

    // Verifica se os dados salvos no store estão limpos
    const patient = useStore.getState().patients.find(p => p.id === 'patient-xss-test');
    const savedAnamnese = patient.history[0].results.anamnese;

    expect(savedAnamnese.identification.name).toBe("Pedro");
    expect(savedAnamnese.mainComplaint.firstWordsAge).toBe("18 meses");
  });
});
