# Política de Privacidade - TeaFono

**Versão:** 1.0  
**Última atualização:** julho de 2026  
**Responsável:** TeaFono Team

---

## 1. Introdução

TeaFono é uma aplicação web especializada para avaliação e intervenção fonoaudiológica no Transtorno do Espectro Autista (TEA). Esta política descreve como coletamos, utilizamos, armazenamos e protegemos seus dados, em conformidade com:

- **LGPD** (Lei Geral de Proteção de Dados) - Brasil
- **GDPR** (General Data Protection Regulation) - União Europeia
- **COPPA** (Children's Online Privacy Protection Act) - EUA

> **IMPORTANTE:** TeaFono processa dados de menores de idade. Os responsáveis legais dos pacientes devem consentir explicitamente antes de qualquer processamento.

---

## 2. Dados Coletados

### 2.1 Dados do Paciente (Menor de Idade)

Coletamos os seguintes dados clínicos necessários para diagnóstico e intervenção:

| Categoria | Dados | Finalidade | Base Legal |
|-----------|-------|-----------|-----------|
| **Identificação** | Nome, data de nascimento, gênero | Registro clínico, identificação do paciente | Consentimento do responsável (LGPD Art. 14) |
| **Clínico** | Queixa fonoaudiológica, diagnóstico | Planejamento terapêutico | Interesse legítimo (saúde do menor) |
| **Avaliações** | M-CHAT-R/F, Pragmática, BAMBI, Anamnese | Diagnóstico diferencial e acompanhamento | Consentimento do responsável |
| **Histórico** | Resultados de avaliações, planos terapêuticos, evolução | Continuidade do cuidado clínico | Interesse legítimo + consentimento |

### 2.2 Dados do Terapeuta

| Categoria | Dados | Finalidade |
|-----------|-------|-----------|
| **Autenticação** | Email, senha (hash) | Acesso seguro à aplicação |
| **Profissional** | Nome, CRFa, especialidade | Identificação profissional, responsabilidade |
| **Uso** | IPs, timestamps de acesso, ações realizadas | Auditoria, segurança, conformidade |

### 2.3 Dados de Uso

Coletamos informações técnicas para melhorar a plataforma:

- Endereço IP
- Tipo de navegador e sistema operacional
- Páginas visitadas e tempo de permanência
- Erros e falhas da aplicação (logs)

---

## 3. Compartilhamento de Dados com Terceiros

### 3.1 Google Gemini API (IA para Plano Terapêutico)

**Quando ocorre:** Quando o usuário clica em "Gerar PTS com IA"

**Dados compartilhados (ANONIMIZADOS):**
- Idade do paciente (clínico)
- Gênero (clínico)
- Queixa fonoaudiológica (clínico)
- Diagnóstico (clínico)
- Resultados de avaliações (clínico)
- Hash do ID do paciente (não reversível)

**Dados NÃO compartilhados:**
- Nome do paciente ❌
- Data de nascimento ❌
- Email ou contato ❌
- Identificação do responsável ❌

**Política de Retenção Google:**
- Conforme [Política de Privacidade do Google](https://policies.google.com/privacy)
- Tipicamente: dados retidos para melhorar modelos de IA (30 dias a 3 meses)

**Seu Consentimento:**
- Um modal de consentimento explícito é mostrado antes de usar a IA
- Você pode revogar o consentimento não usando este recurso

### 3.2 Firebase (Google Cloud)

**Dados armazenados:** Todos os dados clínicos do paciente

**Localização:** Data centers do Google (EUA ou EU conforme configuração)

**Proteção:**
- Criptografia em trânsito (TLS 1.2+)
- Firestore Security Rules (acesso apenas do próprio usuário)
- Backup automático

**Base Legal:** Consentimento do responsável + interesse legítimo

---

## 4. Direitos dos Responsáveis (LGPD Art. 18)

Como responsável legal de um menor, você tem direito a:

### 4.1 Direito de Acesso
- Solicitar cópia de todos os dados do seu filho coletados pela aplicação
- **Como:** Entre em contato com privacidade@teafono.com.br

### 4.2 Direito de Retificação
- Corrigir dados incorretos ou incompletos
- **Como:** Edite diretamente na aplicação ou solicite alteração

### 4.3 Direito de Exclusão ("Direito ao Esquecimento")
- Solicitar exclusão de dados após a finalização do tratamento
- Excluir dados de backup após período de retenção
- **Como:** Solicite via privacidade@teafono.com.br

### 4.4 Direito de Portabilidade
- Receber dados em formato estruturado e legível
- Transferir para outro prestador de serviço
- **Como:** Disponível em Dashboard > Exportar Backup

### 4.5 Direito de Revogar Consentimento
- Revogar consentimento para compartilhamento com IA
- Parar de usar a aplicação a qualquer momento
- **Consequência:** Dados continuam armazenados conforme legislação

---

## 5. Segurança de Dados

### 5.1 Proteção em Trânsito
- ✅ HTTPS/TLS 1.2+ para todas as comunicações
- ✅ Certificados SSL verificados
- ✅ Headers de segurança HTTP (HSTS, X-Frame-Options, CSP)

### 5.2 Proteção em Repouso
- ✅ Dados em localStorage criptografados com AES-256-GCM
- ✅ Firebase Firestore com Rules de segurança
- ✅ Senhas com hash + salt (bcrypt)
- ⚠️ Backup automático não é criptografado (armazenado em Google Cloud)

### 5.3 Controle de Acesso
- ✅ Autenticação Firebase (email/senha, autenticação 2FA disponível)
- ✅ Cada terapeuta vê apenas seus próprios pacientes
- ✅ Token JWT com expiração automática
- ✅ Rate limiting em endpoints de API

### 5.4 Incidentes de Segurança
Se descobrirmos violação de dados:
1. Notificaremos responsáveis dentro de 30 dias
2. Informaremos autoridades (ANPD, supervisores de dados)
3. Descrição do incidente, dados afetados e medidas tomadas
4. Direito de denúncia à ANPD (www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

## 6. Retenção de Dados

| Dado | Retenção | Motivo |
|------|----------|--------|
| Pacientes e avaliações | Até exclusão explícita | Registro clínico obrigatório |
| Histórico de alterações | 3 anos | Auditoria e compliance |
| Logs de acesso | 90 dias | Segurança e diagnóstico |
| Dados de backup | 30 dias | Recuperação de desastres |
| Dados na IA (Gemini) | 30-90 dias | Conforme Google Gemini |
| Sessões expiradas | 7 dias | Recuperação e auditoria |

---

## 7. Bases Legais para Processamento

| Processamento | Base Legal | Fundamento |
|---------------|-----------|-----------|
| Registro e autenticação | Consentimento | Você concorda ao criar conta |
| Armazenamento clínico | Interesse legítimo + consentimento | Saúde e bem-estar do menor |
| Geração de IA | Consentimento explícito | Modal de consentimento |
| Logs e auditoria | Interesse legítimo | Segurança e compliance |
| Análise de uso | Interesse legítimo | Melhoria do serviço |
| Requisitos legais | Obrigação legal | Conforme regulação |

> Menores de idade: Processamento exige consentimento do responsável legal (LGPD Art. 14; GDPR Art. 8)

---

## 8. Conformidade Regulatória

### 8.1 Brasil (LGPD)

TeaFono está registrada como Controadora de Dados junto à ANPD (quando aplicável).

**Direitos dos titulares:**
- Confirmação de processamento
- Acesso aos dados
- Correção de dados incompletos
- Exclusão de dados (Art. 17)
- Revogação de consentimento
- Portabilidade
- Denúncia à ANPD por violações

**Contato:** privacidade@teafono.com.br

### 8.2 GDPR (UE)

Se seu filho reside na EU, seus direitos são ainda mais expandidos:

- **DPO:** Disponível em dpo@teafono.com.br
- **Autoridade de Supervisão:** Depende do país do titular
- **Direito ao esquecimento:** Garantido sob certas circunstâncias
- **Transferência internacional:** Sob padrão contratual (SCC)

---

## 9. Consentimento e Revogação

### 9.1 Como Consentir
Ao criar uma conta em TeaFono, você consente:
1. Armazenamento de dados clínicos em Firebase
2. Processamento conforme esta política
3. Consentimento adicional solicitado para IA (Gemini)

### 9.2 Como Revogar
- **Parar de usar:** Simplesmente saia da aplicação
- **Deletar conta:** Solicite em privacidade@teafono.com.br
- **Recusar IA:** Clique "Cancelar" no modal de consentimento

**Consequência:** Revogar consentimento geral pode impedir uso da aplicação, mas dados permanecem conforme regulação (obrigação legal, interesse legítimo).

---

## 10. Contato e Reclamações

### 10.1 Dúvidas sobre Privacidade
**Email:** privacidade@teafono.com.br  
**Resposta em:** até 30 dias úteis

### 10.2 Solicitar Dados
**Processo:** Abra ticket em Dashboard > Configurações > Solicitar Relatório  
**Prazo:** 30 dias para entrega

### 10.3 Reclame à Autoridade
- **Brasil:** [ANPD](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd) - Autoridade Nacional de Proteção de Dados
- **UE:** Sua autoridade de supervisão local
- **EUA:** FTC (ftc.gov) - Para COPPA

---

## 11. Mudanças nesta Política

Podemos atualizar esta política ocasionalmente. Você será notificado por:
- Email
- Banner no login
- Notificação na aplicação

A data de "Última atualização" acima reflete a versão em vigor.

---

## 12. FAQS

**P: Meu filho pode ter rejeição em escola por "estar no banco de dados"?**  
R: Não. Seus dados estão em seu login privado. Nenhuma terceira instituição tem acesso sem autorização explícita.

**P: Se fechar a conta, meus dados são deletados?**  
R: Começamos processo de exclusão imediato, mas podemos retê-los por requisitos legais (contabilidade, saúde). Confirme em 90 dias.

**P: A Google pode usar dados do meu filho para treinar IA?**  
R: Dados anonimizados podem ser usados pela Google conforme sua [Política de Privacidade](https://policies.google.com/privacy). Você pode recusar usando o botão "Cancelar" no modal de consentimento.

**P: Teafono vende dados?**  
R: **Não.** Nunca vendemos, alugamos ou compartilhamos dados para marketing.

---

**Versão 1.0** | Julho 2026  
Última revisão: Julho 14, 2026  
Próxima revisão esperada: Janeiro 2027
