# Planejamento de Melhorias - Flex Battle

Este plano descreve as correções no sistema de conquistas, sincronização de dados e melhorias visuais com bordas neon nas telas de Batalha e Treino.

## 1. Melhorias Visuais (Bordas Neon)
- **⚔️ Batalha**: Adicionar `NeonFireWrapper` com a cor `blue` nos elementos principais da tela de `Multiplayer` que ainda não possuem.
- **🏋️ Treino**: Adicionar `NeonFireWrapper` com a cor `red` no card de Treino na tela de Dashboard e em `Multiplayer`.
- **Estilo**: Bordas finas, arredondadas e com brilho externo discreto, garantindo que não afetem a performance da câmera.

## 2. Sistema de Conquistas (Lógica Real)
- **Sincronização**: Garantir que o componente `Achievements` utilize o estado `user` centralizado, que já é alimentado pelo Supabase.
- **Progresso Automático**: A função `updateStats` já chama `increment_mission_progress` no banco de dados. Vou garantir que o estado local `user` reflita essas mudanças imediatamente após a conclusão de uma batalha ou treino para que a tela de conquistas mostre o progresso em tempo real.
- **Correção de Dados Mockados**: Remover qualquer dado fixo/mockado da lista de conquistas e garantir que o `current` de cada item aponte para a propriedade correta do objeto `user`.

## 3. Correção da Patente (Bronze III)
- **Bronze III**: A tela de conquistas deve mostrar a patente atual baseada no XP real do usuário. Vou atualizar o item "ÚLTIMA CONQUISTA" no `Achievements` para exibir dinamicamente `rank.rankName` (ex: "Bronze III") em vez de um texto fixo como "Elite".

## Detalhes Técnicos
- Utilizar `useMemo` no componente `Achievements` para recalcular as conquistas sempre que o objeto `user` mudar.
- Garantir que `updateStats` atualize todas as estatísticas relevantes no Supabase e no estado local.
- Aplicar `NeonFireWrapper` de forma otimizada para evitar re-renders desnecessários.
