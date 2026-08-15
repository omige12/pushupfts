# Plan: Redesign Multiplayer Screen and Restore Friend Competition

The objective is to overhaul the "BATALHA" (Multiplayer) screen by removing the numeric ID search block and restoring the "JOGAR COM AMIGOS" card in its place, while keeping the navigation bar and training features consistent.

## User Review Required

> [!IMPORTANT]
> - The "BUSCAR JOGADOR" section (ID search input + Challenge button) will be completely removed from the Multiplayer screen.
> - A new card "JOGAR COM AMIGOS" will be added, which will navigate to the friend challenge system when clicked.
> - All other multiplayer features (Fast Match, Bot Duel, Training Mode) will remain unchanged.

## Proposed Changes

### Frontend Improvements
- **Multiplayer View**:
    - Remove the search card (`BUSCAR JOGADOR`) and its associated logic (ID input, `handleSearch` call).
    - Insert a `NeonFireWrapper` card titled "JOGAR COM AMIGOS".
    - Description: "CONVIDE SEUS AMIGOS E JOGUEM JUNTOS".
    - Styling: Dark background, neon border, blue glow, touch feedback.
    - Icon: `UserIcon` (Friends).
    - Functionality: Navigates to the `friend-challenge` view.
- **Navigation**:
    - Ensure the bottom navigation bar remains at 5 items: INÍCIO, CONQUISTAS, BATALHA, RANKING, PERFIL.
    - Verify that "MODO TREINO" is NOT added to the navigation bar.

## Technical Details

### Code Changes
- **src/routes/index.tsx**:
    - Locate the `Multiplayer` component.
    - Delete the `div` containing "BUSCAR JOGADOR" (lines 2483-2509).
    - Delete the `foundPlayer` conditional rendering (lines 2511-2552).
    - Add a new card inside the grid or list for "JOGAR COM AMIGOS".
    - Update `setView('friend-challenge')` on click.
