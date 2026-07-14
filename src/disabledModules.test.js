import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('módulos desabilitados', () => {
  it('mantém a anamnese fora das rotas e dos pontos de acesso da interface', () => {
    const appSource = readSource('./App.jsx');
    const dashboardSource = readSource('./components/Dashboard.jsx');
    const dashboardPageSource = readSource('./pages/DashboardPage.jsx');

    expect(appSource).not.toContain('AnamnesePage');
    expect(appSource).not.toMatch(/path=["']\/anamnese/);
    expect(dashboardSource).not.toContain("onStartAssessment('anamnese')");
    expect(dashboardSource).not.toContain('hist.results.anamnese');
    expect(dashboardPageSource).not.toMatch(/\banamnese\s*:/);
    expect(dashboardPageSource).not.toContain('onEditAssessment');
  });
});
