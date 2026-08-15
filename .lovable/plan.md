# Redesign Visual das Telas Perfil e Ranking

Este plano foca exclusivamente na atualização estética das telas de Perfil e Ranking, seguindo as referências visuais para um design premium, futurista e mobile-first.

## Mudanças Propostas

### 1. Estilização Global e Design Tokens
- Refinar variáveis de cores em `src/styles.css` para tons mais profundos (azul-marinho/quase preto).
- Adicionar utilitários para bordas neon/glow discretas e cartões premium com glassmorphism avançado.

### 2. Tela de Perfil (`Profile` em `src/routes/index.tsx`)
- **Cabeçalho:** Avatar circular com borda iluminada, nome grande em destaque e ID/Patente em cápsulas modernas.
- **Info Física:** Agrupar peso, idade e altura em uma cápsula elegante.
- **Evolução:** Barra de progresso modernizada com indicadores de nível e XP integrados.
- **Stats Grid:** Cards de Vitórias, Recorde e Total com efeitos neon e tipografia impactante.
- **Ações:** Botões de Histórico e Suporte com bordas coloridas (azul e verde) e glow sutil.
- **Layout:** Ajustar espaçamentos para uma leitura vertical limpa e organizada.

### 3. Tela de Ranking (`Ranking` em `src/routes/index.tsx`)
- **Cabeçalho:** Título "RANKING" em caixa alta, fonte forte e branca.
- **Filtros:** Seletor de cápsula para "Brasil" e "Amigos" com destaque em azul elétrico na aba ativa.
- **Cards de Jogadores:** Design horizontal com bordas arredondadas e glow azul.
- **Identificação:** Posição em destaque, medalha/patente ao lado do nome, e tag "VOCÊ" em cápsula azul.
- **Informações:** Estatísticas menores abaixo do nome e pontuação total alinhada à direita.

### 4. Navegação Inferior
- Garantir que a barra de navegação siga o padrão visual premium, com ícones e labels otimizados para mobile.

## Detalhes Técnicos
- Uso de `framer-motion` para transições suaves entre estados.
- Aplicação de gradientes lineares e `box-shadow` com opacidade reduzida para o efeito de glow.
- Garantia de que nenhuma lógica de negócio ou funcionalidade atual seja alterada.
