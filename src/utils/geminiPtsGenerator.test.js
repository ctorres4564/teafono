// Tests for Gemini client integration (security: token + anonymized payload)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the firebase module: geminiPtsGenerator only imports `auth` from it.
vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('fake-id-token'),
    },
  },
}));

import { callGeminiApi, generateOfflinePlan, GeminiApiError } from './geminiPtsGenerator';

describe('geminiPtsGenerator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws GeminiApiError(401) when no authenticated user (guest mode)', async () => {
    // Override the mocked currentUser for this case
    const { auth } = await import('../firebase');
    auth.currentUser = null;

    await expect(
      callGeminiApi({ id: 'tp_x', name: 'Maria' }, {})
    ).rejects.toBeInstanceOf(GeminiApiError);

    try {
      await callGeminiApi({ id: 'tp_x' }, {});
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });

  it('sends Authorization Bearer token and anonimized payload (no PII)', async () => {
    const { auth } = await import('../firebase');
    auth.currentUser = { getIdToken: vi.fn().mockResolvedValue('fake-id-token') };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ planoDeIntervencao: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await callGeminiApi(
      { id: 'tp_x', name: 'Maria', age: 6, gender: 'F', speechComplaint: 'ecolalia' },
      { mchat: { risk: 'Alto Risco' } }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/generate-pts');
    expect(opts.headers.Authorization).toBe('Bearer fake-id-token');

    const body = JSON.parse(opts.body);
    // PII must NOT be present
    expect(body.patient.name).toBeUndefined();
    expect(body.patient.birthDate).toBeUndefined();
    // Anonimized fields expected
    expect(body.patient.patientHash).toMatch(/^pat_/);
    expect(body.patient.ageYears).toBe(6);
    expect(body.assessments.mchat.risk).toBe('Alto Risco');
  });

  it('generateOfflinePlan returns offline plan without external calls', async () => {
    const plan = await generateOfflinePlan(
      { id: 'tp_x' },
      { mchat: { risk: 'Alto Risco' } }
    );
    expect(plan.planType).toBe('offline');
    expect(plan.models.speechPlan).toContain('CAA');
  });
});
