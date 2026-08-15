# Plano de Implementação - Ajustes de UI e Correções de Perfil

Melhorar o posicionamento das estatísticas na Dashboard, otimizar a velocidade de resposta da navegação inferior, aplicar cores neon na tela de Perfil e corrigir a funcionalidade de edição de perfil.

## Alterações Propostas

### 1. Dashboard: Posicionamento de Estatísticas
- Ajustar as margens e padding da seção de estatísticas inferior para subir o bloco.
- Organizar o grid para alinhamento perfeito dos 4 indicadores.
- Ajustar tamanhos de fonte e ícones para evitar cortes e garantir responsividade.

### 2. Navegação Inferior: Resposta Imediata
- Unificar o padrão de animação no componente de navegação.
- Aplicar efeito de escala rápida e glow instantâneo ao toque.
- Reduzir a duração das transições para garantir feedback em tempo real (~100ms).

### 3. Perfil: Redesign Neon
- Aplicar bordas coloridas aos cards baseadas nas categorias:
    - **Azul Neon:** Informações principais (Nome, ID).
    - **Roxo Neon:** Barra de XP e Evolução.
    - **Dourado/Laranja:** Patentes e Conquistas.
    - **Verde Neon:** Suporte.
    - **Vermelho:** Botão Sair.
- Adicionar glows sutis nos ícones e indicadores físicos (Peso, Idade, Altura).

### 4. Perfil: Correção da Edição
- Verificar e corrigir a funcionalidade do botão de edição (lápis).
- Garantir que o `handleSave` valide e persista os dados no Supabase.
- Implementar atualização imediata do estado global do usuário após salvar.
- Corrigir bugs de sincronização e campos que não salvam.

## Detalhes Técnicos
- Uso de `framer-motion` para animações de alta performance.
- Atualização do componente `Profile` para suportar novas classes neon.
- Refatoração do `handleSave` e `useEffect` de sincronização de dados.
- Ajustes finos no CSS global (`src/styles.css`) para novas variantes utilitárias se necessário.
