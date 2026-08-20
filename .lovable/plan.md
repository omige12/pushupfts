# Plan: Connect and Activate Real Multiplayer and Ranking System

Activate the existing UI components for player search, real-time duels, and rankings by connecting them to functional Supabase logic.

## Technical Details

### 1. Multiplayer - Player Search & Challenge
- **Player Search**: Connect `handleSearch` (Multiplayer) and `searchFriend` (FriendChallenge) to correctly query the `profiles` table using the `player_id` (numeric ID).
- **Challenge Initiation**: When "Desafiar" is clicked, insert a record into the `challenges` table with `status: 'pending'`.
- **Real-time Listening**: Ensure `socialChannel` correctly listens for new challenges and triggers the invite modal for the recipient.
- **Challenge Acceptance**: When accepted, transition both players to the `pvp-battle` or `challenge` view using a shared `match_id`.

### 2. PvP Battle - Real-time Sync
- **Shared State**: Update `Challenge` component to sync push-up counts via Supabase Realtime (using `matches_v2` or a dedicated channel).
- **Competitor Progress**: Each player will see the other's rep count update in real-time.
- **Match Completion**: Determinate the winner server-side or via a coordinated client update that saves to `matches_v2` and updates both profiles' XP/wins/losses.

### 3. Ranking System
- **Global Ranking (Brasil)**: Query all `profiles` ordered by XP, showing the user's position relative to others.
- **Friend Ranking**: Filter `profiles` by IDs retrieved from the `friendships` table (where `status = 'accepted'`).
- **Real Data**: Remove any remaining mock data in the ranking views.

### 4. Database & RLS
- Verify and update RLS policies for `profiles`, `friendships`, `challenges`, and `matches_v2` to allow:
  - Public profile visibility (public fields only: name, xp, avatar).
  - Search by `player_id`.
  - Challenge creation and status updates.

## User Impact
- **Working ID Search**: Players will finally be able to find their friends using their unique IDs.
- **Real Online Duelos**: No more simulations; players will compete against actual human opponents in real-time.
- **Accurate Leaderboards**: Rankings will reflect the actual competitive landscape of the app.
