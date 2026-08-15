# Plano de Correção: Edição de Perfil

O objetivo é corrigir o erro "OPS! ALGO DEU ERRADO" ao editar o perfil, garantindo um fluxo robusto, rápido e amigável para mobile, com persistência real no banco de dados e feedback imediato.

## Alterações

### 1. Diagnóstico e Refatoração de Dados
- **Problema:** A tela de erro genérica do `__root.tsx` é disparada por erros não tratados em `handleSave` ou no ciclo de vida do componente `Profile`. Provavelmente causado por `NaN` em campos numéricos ou descontinuidade de sessão.
- **Solução:**
    - Adicionar validações explícitas e `try-catch` robustos em `handleSave`.
    - Garantir que `age`, `height` e `weight` nunca sejam `NaN` ou `undefined` antes de enviar ao Supabase.
    - Sincronizar o estado local `user` imediatamente após o sucesso da operação para evitar discrepâncias.

### 2. Interface de Edição (UX/UI)
- **Melhoria Mobile:**
    - Ajustar os campos de entrada para usar `inputMode="numeric"` ou `type="number"` para abrir o teclado correto.
    - Adicionar Skeletons para carregamento inicial rápido.
    - Implementar animações suaves com `framer-motion` para transições entre visualização e edição.
- **Botão de Lápis:** Garantir que o clique no ícone de lápis do cabeçalho do perfil carregue os dados mais recentes no `formData`.

### 3. Gerenciamento de Foto (Avatar)
- **Problema:** Atualmente as ações de foto estão ocultas ou não funcionais.
- **Solução:**
    - Reativar e estilizar os botões de "Câmera" e "Galeria" dentro do modo de edição.
    - Adicionar um estado de "preview" da imagem antes de salvar.
    - Se o upload (Base64 no campo `avatar_url`) falhar, tratar o erro sem fechar o modal.

### 4. Tratamento de Erros Específico
- **Solução:**
    - Substituir a tela de erro global por notificações do `sonner` e mensagens de erro inline dentro do próprio formulário.
    - Adicionar um botão "Tentar Novamente" no contexto do salvamento caso falhe.

## Detalhes Técnicos
- **Arquivo Principal:** `src/routes/index.tsx`
- **Validações:** Zod ou validação manual estrita para tipos numéricos.
- **Feedback Visual:** Uso do componente `Skeleton` do shadcn para carregamento e estados de `disabled` nos botões durante o processamento.
- **Banco de Dados:** Utilização direta do cliente `supabase` para `update` na tabela `profiles`.
