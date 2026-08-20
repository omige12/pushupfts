# Real-Time Multiplayer, Ranking & UI Overhaul Plan

This plan implements real-time multiplayer functionality, fixes the ranking system to use live Supabase data, optimizes battle transitions (camera/AI), and enhances the profile search UI.

## 1. UI & Responsivity
- **Mobile Immersion**: Remove black bars on "Início" and "Perfil" by ensuring root containers use `h-[100dvh]` and `safe-area-inset` padding.
- **Search UI**: Replace "Desafiar" with "Informações" in the player search result view.
- **Profile Details**: Implement a dedicated "Informações" modal/view showing real stats (XP, level, wins/losses, rank) from the database.

## 2. Ranking & XP System
- **Real-time Scoring**: Ensure match results (XP and Win/Loss) are saved to the `profiles` table immediately after a battle.
- **Live Ranking**: Update the Ranking view to fetch real data from the `profiles` table, sorting by XP/Score.
- **National Ranking**: Filter or display all Brazilian players using live Supabase queries (no mocks).

## 3. Battle & Opponent Improvements
- **Competitive Matchmaking**: Implement logic to select opponents (or bots) with similar skill levels based on XP and Win Rate.
- **Camera Reliability**: Refactor the "Preparando a câmera" flow to ensure stable initialization, proper permission handling, and a clear fallback to "JOGAR SEM CÂMERA" if hardware fails.
- **Cleanup**: Ensure camera streams are properly stopped when exiting the battle view.

## 4. Technical Details
- **Supabase Realtime**: Use `matches_v2` and `challenges` tables for real-time synchronization.
- **RLS**: Verify and update Row Level Security policies to allow public profile reads for ID search and ranking.
- **State Management**: Use TanStack Query (if available) or optimized `useEffect` hooks to keep the UI in sync with the database.

## 5. Verification
- Test player search with a real 8-digit ID.
- Verify XP updates in the database after a training or duel session.
- Confirm the camera initializes correctly without getting stuck.
