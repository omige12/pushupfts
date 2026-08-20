# Plan: Responsividade e Alinhamento do FlexBattle

Corrigir a responsividade, alinhamento e espaços vazios nas telas INÍCIO, BATALHA e PERFIL, garantindo um visual de aplicativo nativo profissional.

## Alterações

### 1. Ajustes Globais e Estruturais
- Atualizar o container principal no `App` (`src/routes/index.tsx`) para garantir que ele ocupe exatamente o viewport (`h-[100dvh]`) e evite rolagem desnecessária.
- Refinar o componente `Nav` para garantir que ele esteja sempre visível e bem posicionado no rodapé da tela, respeitando a `safe-area-bottom`.

### 2. Tela INÍCIO (Dashboard)
- Ajustar o `Dashboard` para remover `min-h-screen` e usar um layout flexível que distribua o conteúdo uniformemente sem deixar buracos no final.
- Centralizar os cards de ação e o card de patente, reduzindo gaps excessivos em telas menores.
- Corrigir o rodapé de estatísticas para que fique fixo ou bem posicionado acima da barra de navegação.

### 3. Tela BATALHA (Challenge)
- Remover espaços vazios no componente `Challenge`.
- Ajustar a posição do contador circular de flexões e dos perfis dos jogadores para que fiquem harmoniosos no viewport do celular.
- Garantir que a área da câmera ocupe o espaço disponível sem criar barras pretas desproporcionais.

### 4. Tela PERFIL
- Organizar os elementos do Perfil em uma estrutura de grade rigorosa.
- **Header:** Foto de perfil, nome e IDs centralizados com alinhamento vertical consistente.
- **Estatísticas:** Cards de Vitórias, Recorde e Total alinhados em uma única linha (grid de 3 colunas) com alturas idênticas.
- **Botões:** Alinhar os botões de Histórico, Suporte e Sair da Conta com a mesma largura e espaçamento.
- Remover o `pb-32` excessivo e o `min-h-screen` que causa rolagem artificial.

### 5. Responsividade
- Substituir valores fixos de `padding` e `margin` por unidades relativas ou utilitários do Tailwind que se adaptem à altura da tela (`dvh`).

## Detalhes Técnicos
- Utilizar `h-[100dvh]` nos containers raiz das visualizações.
- Aplicar `flex-1` em áreas de conteúdo para empurrar rodapés para baixo ou manter o conteúdo centralizado.
- Remover `max-w-sm` individuais de componentes e manter um `max-w-md` único no container pai para alinhamento perfeito.
- Revisar `safe-area-padding` e aplicar consistentemente onde necessário.

Nenhuma lógica de negócio, RLS ou funcionalidade será alterada. Focus exclusivo em UI/UX e Layout.
