# Plano de Melhoria e Otimização - Flex Battle

Este plano visa transformar o Flex Battle em uma experiência mobile profissional, otimizando o desempenho, a interface e as funcionalidades principais solicitadas.

## Mudanças Propostas

### 1. Quiz de Perfil e Onboarding
- Reformular o `Quiz` em `src/routes/index.tsx` para um formato passo a passo moderno.
- Implementar campos de entrada numérica direta para **Altura** e **Peso**, garantindo que o teclado mobile não cubra os campos.
- Adicionar barra de progresso visual, animações de transição suave entre perguntas e validação de dados.
- Simplificar o fluxo: Quiz -> Cadastro -> Dashboard (removendo telas intermediárias desnecessárias).

### 2. Adaptação Mobile e Identidade Visual
- Ajustar o layout global em `src/styles.css` e componentes principais para garantir que o app pareça nativo (sem barras de rolagem desnecessárias, botões com áreas de toque otimizadas).
- Melhorar a hierarquia visual nas telas de Login, Cadastro e Dashboard com cards modernos e bordas arredondadas.
- Garantir que nenhum elemento seja cortado em telas menores e que o espaçamento seja consistente.

### 3. Suporte com IA (Arena AI)
- Corrigir a função `SupportChat` em `src/routes/index.tsx` para ser um chat funcional e dinâmico.
- Expandir o escopo da IA para responder sobre exercícios, tecnologia, estudos e perguntas gerais, mantendo a cautela em temas de saúde.
- Adicionar indicadores visuais de "IA digitando" e tratamento de erros de conexão.

### 4. Otimização da Câmera e IA de Postura
- Otimizar o `PushUpCounter` em `src/components/PushUpCounter.tsx` para inicialização instantânea da câmera.
- Ajustar a configuração do MediaPipe Pose para usar `modelComplexity: 0` por padrão no mobile, reduzindo o lag.
- Melhorar o feedback visual de postura e o processamento de frames para evitar travamentos em dispositivos de médio desempenho.

### 5. Desempenho e Carregamento
- Implementar Skeleton Loaders para evitar telas brancas durante o carregamento de dados do backend.
- Otimizar o estado inicial do aplicativo para mostrar a interface imediatamente enquanto os dados são buscados em segundo plano.
- Reduzir reinicializações desnecessárias de componentes.

## Detalhes Técnicos
- **Framer Motion**: Utilizado para transições suaves e animações de entrada/saída.
- **MediaPipe Pose**: Configurado para baixo consumo de energia no mobile.
- **Supabase**: Sincronização otimizada de dados de perfil e estatísticas.
- **CSS Variables**: Ajuste fino dos tokens de design para manter a consistência visual.
