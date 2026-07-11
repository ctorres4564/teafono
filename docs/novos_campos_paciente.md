# Documentação: Data de Nascimento, Idade Dinâmica e Queixa Fonoaudiológica

Esta funcionalidade adiciona suporte a mais dois campos essenciais na ficha clínica de cada paciente infantil no sistema **TeaFono**:
1. **Data de Nascimento** (usada para calcular dinamicamente a idade).
2. **Queixa Fonoaudiológica** (texto detalhando os motivos de busca pelo atendimento fonoaudiológico).

---

## Arquitetura e Modelagem

Os novos atributos foram adicionados à estrutura do objeto de paciente (`patient`):
```json
{
  "id": "tp_123456789",
  "name": "Nome da Criança",
  "age": 4, // Inteiro atualizado automaticamente no cadastro a partir da data de nascimento
  "gender": "Masculino",
  "diagnosis": "TEA Nível 2",
  "birthDate": "2022-03-15", // Formato YYYY-MM-DD
  "speechComplaint": "Queixa fonoaudiológica...",
  "createdAt": "2026-06-20T10:00:00.000Z",
  "history": []
}
```

---

## Fluxo de Dados

1. **Entrada de Dados (Cadastro)**:
   - No componente [Dashboard.jsx](file:///c:/antigravity/PROJETO%20FONO/teafono/src/components/Dashboard.jsx), o usuário preenche a **Data de Nascimento** (`birthDate`).
   - A função `calculateAge` calcula dinamicamente a idade da criança comparando o ano/mês/dia atual com a data selecionada:
     ```javascript
     const calculateAge = (birthDateString) => {
       if (!birthDateString) return '';
       const today = new Date();
       const birthDate = new Date(birthDateString);
       let age = today.getFullYear() - birthDate.getFullYear();
       const m = today.getMonth() - birthDate.getMonth();
       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
         age--;
       }
       return age < 0 ? 0 : age;
     };
     ```
   - O campo **Idade (anos)** se torna auto-calculado e somente leitura (`readOnly`) para evitar divergências.
   - O usuário opcionalmente detalha a **Queixa Fonoaudiológica** em um campo de texto (`textarea`).
   
2. **Salvamento e Persistência**:
   - O evento dispara `onAddPatient` em [App.jsx](file:///c:/antigravity/PROJETO%20FONO/teafono/src/App.jsx).
   - O objeto contendo `birthDate` e `speechComplaint` é salvo localmente em `localStorage` e sincronizado com o Firestore (se ativado).

3. **Exibição e Impressão**:
   - **Painel Principal**: Exibe a data de nascimento formatada (pt-BR), a idade correspondente e a queixa fonoaudiológica dentro do painel de detalhes do paciente selecionado no Dashboard.
   - **Laudo Técnico**: O componente [ReportModule.jsx](file:///c:/antigravity/PROJETO%20FONO/teafono/src/components/ReportModule.jsx) adiciona os novos metadados à ficha impressa, garantindo formalidade no documento emitido.

---

## Como manter e evoluir
- Caso seja necessário calcular a idade com precisão em meses (ex: "2 anos e 3 meses"), a função `calculateAge` no [Dashboard.jsx](file:///c:/antigravity/PROJETO%20FONO/teafono/src/components/Dashboard.jsx) pode ser adaptada para retornar uma string estruturada ou objeto, atualizando os tipos de dados e layouts correspondentes.
