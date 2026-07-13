# TeaFono - Avaliação e Intervenção Fonoaudiológica no Autismo (TEA)

Sistema de avaliação e intervenção fonoaudiológica especializado no Transtorno do Espectro Autista (TEA). Plataforma de triagem, avaliação, comunicação alternativa e geração de laudos para fonoaudiólogos.

## Funcionalidades

- **M-CHAT-R/F** — Triagem de sinais precoces de autismo (20 questões) com Follow-Up para casos de Médio Risco
- **Pragmática (Fernandes)** — Perfil funcional da comunicação com cronômetro, contagem de meios comunicativos e funções
- **BAMBI** — Inventário de comportamento alimentar com 18 questões em escala Likert
- **CAA (Comunicação Alternativa)** — Prancha vocalizada com síntese de voz, sugestões inteligentes e captura de imagens pela câmera
- **Laudos** — Geração de laudos profissionais com impressão e exportação PDF
- **PTS com IA** — Plano Terapêutico Singular com Google Gemini (fallback offline)
- **Gráficos de evolução** — Visualização da progressão pragmática com Recharts
- **Autenticação** — Firebase Auth com modo convidado offline
- **Tema claro/escuro** — Design sensorialmente amigável
- **Backup/Restore** — Exportação e importação de fichas em JSON

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + React Router |
| Gerenciamento de estado | Zustand |
| Bundler | Vite 8 |
| Backend | Firebase (Auth + Firestore) |
| IA | Google Gemini 2.0 Flash Lite |
| Gráficos | Recharts |
| PDF | jsPDF |
| Síntese de voz | Web Speech API |
| Testes | Vitest + Testing Library |
| Linting | Oxlint |
| Ícones | Lucide React |

## Configuração

1. Clone o repositório
2. Copie `.env.example` para `.env` e preencha as credenciais do Firebase
3. (Opcional) Configure `GEMINI_API_KEY` no Vercel (variável de ambiente server-side) para o PTS com IA
4. Instale as dependências:

```bash
npm install
```

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Executa testes unitários |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Linting do código |
| `npm run preview` | Preview do build |

## Estrutura do Projeto

```
src/
├── App.jsx              # Configuração do Router + Auth guards
├── main.jsx             # Entry point
├── index.css            # Design system (temas, componentes, responsivo, print)
├── firebase.js          # Integração Firebase (Auth + Firestore)
├── store/
│   └── useStore.js      # Estado global com Zustand
├── components/
│   ├── Layout.jsx       # Layout com header e Outlet
│   ├── Dashboard.jsx    # CRUD de pacientes + histórico + gráficos
│   ├── Login.jsx        # Login, cadastro, recuperação de senha
│   ├── MchatModule.jsx  # Triagem M-CHAT-R/F (20 questões)
│   ├── BambiModule.jsx  # Inventário alimentar BAMBI
│   ├── PragmaticsModule.jsx  # Perfil pragmático com cronômetro
│   ├── ComunicaTeaModule.jsx # Prancha de CAA vocalizada
│   ├── ReportModule.jsx # Laudos + PTS com IA + export PDF
│   └── TherapistSettings.jsx # Configurações do fonoaudiólogo
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── MchatPage.jsx
│   ├── FollowUpPage.jsx     # Entrevista de seguimento M-CHAT
│   ├── PragmaticsPage.jsx
│   ├── BambiPage.jsx
│   ├── CaaPage.jsx
│   └── ReportPage.jsx
└── utils/
    ├── teaEvaluations.js    # Lógica de scoring + mock data
    ├── teaEvaluations.test.js # Testes unitários
    └── geminiPtsGenerator.js # Integração Google Gemini
```

## Protocolos Científicos

- **M-CHAT-R/F**: Robins, Fein & Barton (2009)
- **Pragmática**: Fernandes, F. D. M. (2004) — Perfil Funcional da Comunicação
- **BAMBI**: Lukens & Linscheid (2005) — Brief Autism Mealtime Behavior Inventory

## Licença

Projeto privado — TeaFono
