# Documentação - Imagens do Módulo de Fonologia

Esta documentação descreve a arquitetura, o fluxo de dados e os padrões de manutenção das imagens utilizadas no Teste de Fonologia do sistema TEAFONO.

## 1. Arquitetura das Imagens

As ilustrações do Teste de Fonologia são carregadas de forma estática pelo frontend do aplicativo. Elas estão estruturadas da seguinte forma:

* **Diretório no Projeto**: As imagens físicas são armazenadas no diretório de ativos públicos em `public/assets/images/phonology/`.
* **Padrão de Nomenclatura**:
  `[palavra-alvo]_ilustracao_[timestamp].png`
  *Exemplo*: `cachorro_ilustracao_1784132950201.png`
* **Formato e Resolução**: Imagens em formato PNG com canal alfa (fundo transparente/branco) e dimensões adequadas para exibição em dispositivos móveis e desktop (cerca de 512x512 a 1024x1024 pixels).

---

## 2. Fluxo de Dados e Integração

O carregamento das imagens no componente do Módulo de Fonologia segue o fluxo abaixo:

1. **Definição dos Itens (Model/Store)**:
   O arquivo `src/store/assessments/items/phonologyItems.js` define a lista de palavras-alvo (`PHONOLOGY_WORDS`) com as propriedades:
   * `id`: Identificador único da palavra (ex: `pw18`).
   * `target`: A palavra-alvo em português (ex: `Cachorro`).
   * `imageUrl`: O caminho absoluto a partir do diretório raiz público (ex: `/assets/images/phonology/cachorro_ilustracao_1784132950201.png`).

2. **Consumo no Componente**:
   O componente `src/components/PhonologyModule.jsx` importa `PHONOLOGY_WORDS` e renderiza a imagem associada à palavra selecionada atual utilizando uma tag standard `<img>`.

3. **Renderização**:
   Como as imagens estão em `public/`, o Vite as copia diretamente para a raiz da build na distribuição do projeto, tornando-as acessíveis publicamente através do caminho definido em `imageUrl`.

---

## 3. Como Manter e Adicionar Novas Imagens

Para adicionar novas imagens ou substituir as existentes, siga os passos abaixo para garantir a consistência técnica e visual:

### 3.1. Estilo Visual das Ilustrações
Todas as imagens do teste de fonologia devem seguir as diretrizes visuais estabelecidas:
* **Estilo**: Desenho vetorial 2D simples, traços de contorno escuros espessos e bem definidos. Estilo "adesivo/sticker" infantil fofo.
* **Paleta de Cores**: Tons pastéis suaves, alegres e amigáveis, sem gradientes de cor realistas complexos.
* **Fundo**: Branco puro (`#FFFFFF`) ou canal alfa transparente.
* **Especificação dos Prompts**: Ao gerar novos prompts usando IAs de geração de imagens (como Imagen ou Midjourney), estruture a descrição contendo:
  * **[Tema]**: Ilustração fofa do objeto de frente, sorrindo (se cabível).
  * **[Ângulo de Câmera]**: Visão frontal ao nível dos olhos.
  * **[Iluminação]**: Iluminação plana de estúdio, sem sombras marcadas.
  * **[Lente/Equipamento]**: Vetor digital limpo, contornos escuros definidos, estilo de ilustração de livro infantil.

### 3.2. Passos para Integração de Novo Item
1. Gere e baixe a imagem no formato PNG.
2. Salve no diretório `public/assets/images/phonology/` usando a nomenclatura padrão.
3. Se houver novas diretrizes de prompts, registre-as no arquivo de referência `prompts/phonology_images_prompts.md`.
4. Abra o arquivo `src/store/assessments/items/phonologyItems.js` e adicione a propriedade `imageUrl` apontando para o arquivo copiado.
5. Execute os testes locais (`npm run test`) e o linter (`npm run lint`) para garantir a conformidade do código.
6. Realize o commit seguindo a especificação convencional e efetue o push para o repositório.
