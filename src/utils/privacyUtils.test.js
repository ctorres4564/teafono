// Tests for privacy/anonymization utilities
import { describe, it, expect } from 'vitest';
import {
  anonimizePatientData,
  validateNoPersonalData,
} from './privacyUtils';

describe('privacyUtils', () => {
  it('anonimizePatientData strips PII and never includes name/birthDate', async () => {
    const out = await anonimizePatientData({
      id: 'tp_123',
      name: 'Maria',
      birthDate: '2019-05-05',
      age: 6,
      gender: 'F',
      speechComplaint: 'ecolalia',
      diagnosis: 'TEA',
    });

    expect(out.patientHash).toMatch(/^pat_/);
    expect(out.name).toBeUndefined();
    expect(out.birthDate).toBeUndefined();
    expect(out.ageYears).toBe(6);
    expect(out.gender).toBe('F');
    expect(out.speechComplaint).toBe('ecolalia');
    expect(out.diagnosis).toBe('TEA');
  });

  it('anonimizePatientData handles null/undefined patient', async () => {
    expect(await anonimizePatientData(null)).toEqual({});
    expect(await anonimizePatientData(undefined)).toEqual({});
  });

  it('validateNoPersonalData detects forbidden fields', () => {
    expect(validateNoPersonalData({ name: 'x', cpf: 'y' })).toEqual(
      expect.arrayContaining(['name', 'cpf'])
    );
    expect(validateNoPersonalData({ patientHash: 'pat_1', ageYears: 5 })).toEqual([]);
    expect(validateNoPersonalData(null)).toEqual([]);
  });
});
