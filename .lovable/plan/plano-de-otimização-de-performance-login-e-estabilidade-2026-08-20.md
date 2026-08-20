# Plano de Otimização de Performance, Login e Estabilidade

Este plano visa corrigir problemas críticos de carregamento infinito e tela preta, além de otimizar a responsividade e a fluidez do aplicativo em dispositivos móveis.

## 1. Correção Urgente do Sistema de Autenticação e Login
- **Diagnóstico**: O aplicativo apresenta estados de carregamento que podem se tornar infinitos e telas pretas durante a verificação de sessão.
- **Implementação**:
    - Criar um estado de inicialização robusto no `src/routes/index.tsx` com `authStatus: 'checking' | 'authenticated' | 'unauthenticated' | 'error'`.
    - Adicionar um **timeout de segurança** (10 segundos) na verificação inicial da sessão do Supabase. Se falhar, redirecionar para a tela de autenticação ou mostrar erro amigável.
    - Garantir que o `finally` no `fetchProfile` sempre desative o estado de carregamento, mesmo em caso de erro catastrófico.
    - Implementar tratamento de erro real no `handleAuth` com mensagens claras e recuperação.

## 2. Aceleração de Feedback Visual e Botões
- **Otimização de Toque**: 
    - Garantir que todos os componentes `Button` e `NeonFireWrapper` usem `whileTap={{ scale: 0.95 }}` de forma consistente.
    - Implementar uma classe utilitária `.btn-active-state` para feedback imediato via CSS, reduzindo a dependência de JavaScript para o primeiro feedback visual.
    - Desabilitar botões durante operações assíncronas (`isSaving`, `isLoading`) para evitar cliques duplos.

## 3. Otimização de Carregamentos e Fluxos
- **Paralelização**: Executar o carregamento do perfil e do histórico de partidas em paralelo usando `Promise.allSettled`.
- **Lazy Loading**: Otimizar a renderização das telas pesadas (como o `Challenge` e `Multiplayer`) garantindo que recursos pesados (como câmera/IA) só sejam inicializados no momento exato da necessidade.
- **Estabilidade**: Substituir telas pretas por skeletons de carregamento neon ou um loader minimalista que respeite o design.

## 4. Melhoria da Inicialização e Mobile Performance
- **Safe Area & Viewport**: Corrigir problemas de alinhamento vertical e gaps brancos no dashboard e perfil para garantir um visual de "aplicativo nativo".
- **Asset Loading**: Garantir que as imagens e assets JSON (MediaPipe) sejam carregados com prioridade correta.

## Detalhes Técnicos
- Utilização de `useMemo` e `useCallback` para evitar re-renderizações desnecessárias em componentes de alta frequência (contador de flexões).
- Implementação de um `ErrorBoundary` customizado para rotas sensíveis.
- Refatoração dos hooks de Supabase Realtime para garantir limpeza correta e evitar vazamento de memória.
