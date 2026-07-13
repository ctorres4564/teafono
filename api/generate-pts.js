import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  return initializeApp({ projectId });
}

async function getVerifiedUid(req) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(match[1]);
    return decoded.uid;
  } catch (err) {
    console.error('[generate-pts] Token inválido:', err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uid = await getVerifiedUid(req);
  if (!uid) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'API key not configured', offline: true });
  }

  try {
    const { patient, assessments } = req.body;
    if (!patient || !assessments) {
      return res.status(400).json({ error: 'Missing patient or assessments' });
    }

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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return res.status(429).json({ error: 'Limite de taxa excedido', retryAfter: 5000 });
      }
      if (status === 503) {
        return res.status(503).json({ error: 'Serviço temporariamente indisponível', retryAfter: 15000 });
      }
      return res.status(status).json({ error: 'Erro na chamada da API Gemini' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Resposta inválida da IA' });
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      const jsonMatch = text.match(/\{[^]*\}/);
      if (jsonMatch) {
        try {
          return res.status(200).json(JSON.parse(jsonMatch[0]));
        } catch (parseErr) {
          console.error('[generate-pts] Falha ao parsear JSON extraído:', parseErr.message);
        }
      }
    }

    return res.status(500).json({ error: 'Formato de resposta inesperado' });

  } catch (error) {
    console.error('[generate-pts] Erro no servidor:', error);
    return res.status(500).json({ error: 'Falha interna do servidor', offline: true });
  }
}
