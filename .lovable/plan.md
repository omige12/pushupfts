# Redesign da Tela de Batalha (FlexBattle)

Este plano detalha o redesenho completo da interface de batalha, inspirando-se na referência visual fornecida para criar uma experiência mobile premium e competitiva.

## Mudanças Propostas

### 1. Refatoração do Componente `PushUpCounter`
- Ajustar o esqueleto para usar círculos luminosos nos pontos de articulação e linhas finas e modernas.
- Remover o feedback textual central e o contador padrão do componente interno, permitindo que a tela de batalha controle a UI.
- Garantir que a câmera ocupe toda a área destinada sem distorções.

### 2. Redesenho da HUD de Batalha em `src/routes/index.tsx`
- **Topo (Jogadores):**
  - Implementar molduras hexagonais com efeitos de brilho neon para o usuário (esquerda) e adversário (direita).
  - Exibir o ELO/Rank próximo à foto de perfil com ícones de liga.
  - Centralizar o cronômetro com grande destaque visual (estilo tabular premium).
- **Placar e Progresso:**
  - Colocar as pontuações em destaque logo abaixo dos perfis.
  - Criar uma barra de progresso horizontal dinâmica entre os dois jogadores que indica quem está na frente.
- **Contador de Flexões:**
  - Posicionar um contador circular grande na parte inferior da câmera (estilo medalhão amarelo da referência).
  - Adicionar animações de pulso (scale) e brilho (glow) a cada flexão validada.

### 3. Identidade Visual e Animações
- Aplicar o esquema de cores premium do FlexBattle (Electric Blue, Energy Red, Gold).
- Implementar microanimações com `framer-motion` para atualizações de placar, tempo e validação de movimentos.
- Utilizar glassmorphism e sombras profundas para profundidade da interface.

## Detalhes Técnicos

- **Componente:** Modificações em `PushUpCounter` (lógica de desenho do esqueleto) e `Challenge` (layout da HUD).
- **Estilo:** Utilização intensiva de `clip-path-hexagon` definido no `styles.css` e novas utilidades para brilhos neon.
- **Performance:** Manter as otimizações de detecção de pose para dispositivos móveis (15 FPS).
- **Responsividade:** Layout flexível usando Tailwind CSS para garantir que elementos não se sobreponham em telas pequenas.

## Próximos Passos
1. Modificar `PushUpCounter.tsx` para suporte ao novo estilo de esqueleto.
2. Atualizar o componente `Challenge` em `src/routes/index.tsx` com a nova estrutura de HUD hexagonal e contador circular.
3. Testar a interface em diferentes resoluções simuladas.
