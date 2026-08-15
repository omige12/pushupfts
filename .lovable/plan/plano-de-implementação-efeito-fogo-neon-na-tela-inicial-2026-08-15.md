# Plano de Implementação: Efeito Fogo Neon na Tela Inicial

Implementação de um efeito visual de chamas neon animadas nos principais cards da Dashboard, com cores dinâmicas e interatividade ao toque, mantendo o desempenho em dispositivos móveis.

## Alterações Visuais

### 1. Sistema de Animação de Fogo (CSS)
*   Criação de animações leves no `src/styles.css` usando `box-shadow` pulsante e partículas de pseudo-elementos (`::before`, `::after`).
*   Definição de variáveis de cor neon para cada tipo de chama (Azul, Roxo, Vermelho, Ouro).
*   Implementação de `@keyframes` para o movimento das chamas e brilho.

### 2. Componente de Invólucro `NeonFireWrapper` (React)
*   Criação de um novo componente funcional no `src/routes/index.tsx` para envolver os botões.
*   Este componente gerenciará o estado de "toque" para intensificar o efeito temporariamente (escala e brilho).
*   Uso de `framer-motion` para animações suaves de entrada e partículas.

### 3. Aplicação na Home (Dashboard)
*   **Card de Patente:** Fogo Dourado/Laranja.
*   **Botão Batalha:** Fogo Azul Neon.
*   **Botão Missões:** Fogo Roxo Neon.
*   **Card de Treino:** Fogo Vermelho Neon.

## Detalhes Técnicos

### Estrutura do Efeito
```text
[ Card/Botão ]
  |-- ::before (Chama de Fundo - Glow difuso pulsante)
  |-- ::after (Chama de Borda - Gradiente animado)
  |-- Partículas (Framer Motion - div.absolute com movimento aleatório leve)
```

### Otimização Mobile
*   Uso de `will-change: transform, box-shadow` para aceleração de hardware.
*   Limitação de partículas para evitar consumo excessivo de CPU.
*   Efeitos de "glow" usando sombras simples em vez de filtros pesados como `blur`.

### Comportamento ao Toque
*   Transição rápida (100ms) para estado intenso.
*   Aumento de escala do botão em 0.95x (efeito de pressão).
*   Aumento do brilho e densidade das partículas.
*   Retorno suave ao estado normal em 300ms.
