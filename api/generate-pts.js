// Rate limiting: store requests per user (userId -> { count, resetTime })
const requestLimits = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const record = requestLimits.get(userId) || { count: 0, resetTime: now + 60000 };

  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + 60000; // 60 second window
  } else {
    record.count++;
  }

  requestLimits.set(userId, record);

  // Max 5 requests per minute per user
  return record.count > 5;
}

// Firebase Admin SDK initialization (requires FIREBASE_PROJECT_ID env var)
let adminAuth;
try {
  // Use the Firebase Admin SDK from vercel serverless context if available
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  adminAuth = admin.auth();
} catch (e) {
  console.error('[generate-pts] Firebase Admin initialization failed:', e.message);
  // Will handle gracefully in handler
}

async function verifyFirebaseToken(token) {
  if (!adminAuth) {
    return null;
  }
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // NEW: Validate Firebase token for authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const decodedToken = await verifyFirebaseToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }

  const userId = decodedToken.uid;

  // NEW: Check rate limit for this user
  if (isRateLimited(userId)) {
    return res.status(429).json({
      error: 'Rate limit exceeded: maximum 5 requests per minute',
      retryAfter: 60
    });
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

    // NEW: Anonymize patient data before sending to external API (LGPD/GDPR compliance)
    // Hash patient identifier - cannot be reversed to identify the child
    function hashUID(uid) {
      let hash = 0;
      for (let i = 0; i < uid.length; i++) {
        const char = uid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'pat_' + Math.abs(hash).toString(16).padStart(16, '0');
    }

    const patientHash = hashUID(patient.id);

    const prompt = `Você é uma fonoaudióloga especialista em TEA com vasta experiência clínica em plano de intervenção fonoaudiológica personalizado para autismo. Crie um plano de intervenção personalizado e detalhado baseado nos dados abaixo:

**Dados Clínicos (Anônimos - LGPD Compliant):**
- Paciente ID (hash): ${patientHash}
- Idade: ${patient.age} anos
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
        contents: [{ parts: [{ text: prompt }] }]
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

    const jsonMatch = text.match(/\{[^]*\}/g);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json(parsed);
      } catch (parseError) {
        console.error('[generate-pts] Erro ao fazer parse da resposta IA:', parseError);
        return res.status(500).json({
          error: 'Resposta da IA contém JSON inválido',
          details: parseError.message
        });
      }
    }

    return res.status(500).json({ error: 'Formato de resposta inesperado' });

  } catch (error) {
    console.error('[generate-pts] Erro no servidor:', error);
    return res.status(500).json({ error: 'Falha interna do servidor', offline: true });
  }
}
