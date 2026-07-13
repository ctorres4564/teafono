# Módulo de Anamnese - DESATIVADO

## Status
**DESATIVADO** - Em espera para reimplementação futura

## Data de Desativação
2026-07-13

## Arquivos Preservados
- `AnamnesePage.jsx` - Página principal do módulo
- `AnamneseModule.jsx` - Componente do formulário de anamnese
- `README.md` - Este arquivo

## Alterações Realizadas para Desativar

### Removido de App.jsx
- Import de `AnamnesePage`
- Rota `/anamnese/:patientId/:entryId?`

### Removido de components/Dashboard.jsx
- Botão "Anamnese Fonoaudiológica" (era o primeiro botão das avaliações)
- Badge de edição de anamnese no histórico

### Removido de pages/DashboardPage.jsx
- Entrada `anamnese: 'anamnese'` da routeMap

### Desativado em Testes
- useStore.test.js: Todos os testes relacionados a anamnese marcados com `.skip()`
- useStore.initAuth.test.js: Teste de persistência de anamnese marcado com `.skip()`

## Dados Preservados
❌ **NENHUM DADO FOI DELETADO**
- Documentos do Firestore permanecem intactos
- Histórico de pacientes com anamnese permanece na store
- localStorage não foi alterado
- Regras do Firestore não foram modificadas

## Como Reativar

Para reativar o módulo de Anamnese no futuro:

1. **Restaurar imports e rotas em App.jsx**
   ```javascript
   import AnamnesePage from './pages/AnamnesePage';
   // Adicionar rota: <Route path="/anamnese/:patientId/:entryId?" element={<AnamnesePage />} />
   ```

2. **Restaurar botão em Dashboard.jsx**
   ```javascript
   <button className="btn btn-primary" onClick={() => onStartAssessment('anamnese')} style={{ justifyContent: 'flex-start', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
     Anamnese Fonoaudiológica
   </button>
   ```

3. **Restaurar badge em Dashboard.jsx**
   ```javascript
   {hist.results.anamnese && (
     <span onClick={() => onEditAssessment?.('anamnese', hist.id)} className="badge badge-info" style={{ fontSize: '0.65rem', background: '#6366f1', color: '#fff', cursor: 'pointer' }} title="Clique para editar">Anamnese ✎</span>
   )}
   ```

4. **Restaurar rota em DashboardPage.jsx**
   ```javascript
   anamnese: 'anamnese',
   ```

5. **Restaurar testes**
   - Remover `.skip` de todos os testes marcados em useStore.test.js
   - Remover `.skip` do teste em useStore.initAuth.test.js

6. **Mover arquivos de volta**
   ```bash
   mv src/disabled-modules/anamnese/AnamnesePage.jsx src/pages/
   mv src/disabled-modules/anamnese/AnamneseModule.jsx src/components/
   ```

## Notas Importantes

- Os dados da anamnese continuam sendo salvos normalmente se o usuário fornecer as informações através de outros componentes
- O módulo pode ser reativado sem risco de perda de dados
- Todos os testes estão preservados e apenas marcados como `.skip()`
- Os estilos e componentes compartilhados (AssessmentHeader) não foram alterados

## Referências Adicionais

- Badge no histórico permitia editar anamnese já salvadas (botão com ícone ✎)
- O módulo armazenava dados em `results.anamnese` no histórico do paciente
- Componente AssessmentHeader é compartilhado com outros módulos
