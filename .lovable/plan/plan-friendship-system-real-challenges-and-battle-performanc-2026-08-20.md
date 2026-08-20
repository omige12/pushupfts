# Plan: Friendship System, Real Challenges, and Battle Performance Fix

Implementing a real-time friendship invitation system, fixing challenge confirmation flows, and resolving the infinite loading issue in battles.

## User Review Required

> [!IMPORTANT]
> - Real-time notifications for friend requests and battle challenges will be enabled.
> - The 8-digit Player ID system will remain unchanged.
> - A new "CONVITES" (Invites) UI will be added to the social screen to manage incoming requests.

## Proposed Changes

### Database & Security (Supabase)
- **Friendship RLS**: Update policies for `friendships` to allow users to see pending requests sent to them and manage their own friendships.
- **Grants**: Ensure `friendships`, `challenges`, and `matches_v2` have proper `GRANT` statements.

### 1. Friendship & Invites System
- **Real-time Listener**: Enhance the existing `social-interactions` channel to track pending friend requests.
- **"CONVITES" UI**: Add a dedicated button/modal in the `FriendChallenge` view.
- **Logic**:
    - Check if friendship already exists or is pending before sending.
    - Accept/Decline actions that update the `friendships` table.
    - Badge indicator for new invites.

### 2. Challenge Confirmation Flow
- **Challenger**: Create a `pending` challenge in the database.
- **Opponent**: Receives real-time notification (already partially implemented, but needs UI refinement to allow Accept/Decline).
- **Match Creation**: Only create `matches_v2` AFTER the opponent accepts.

### 3. Battle Performance & Loading Fix
- **Investigation**: Debug the `Challenge` component's initialization.
- **Optimization**:
    - Move camera initialization to a more stable state.
    - Prevent duplicate `supabase.channel` subscriptions.
    - Add a "stuck" recovery mechanism if camera or matchmaking fails to respond.
    - Ensure `PushUpCounter` cleanup on exit.

### 4. UI Refinements
- **Social Screen**: Add the "CONVITES" button with a red dot notification icon.
- **Matchmaking Overlay**: Improve clarity when waiting for a friend to accept.

## Technical Details

- **Friendships Table**: Use `status` column ('pending', 'accepted', 'declined').
- **Real-time**: Use `postgres_changes` on `friendships` and `challenges`.
- **Loading State**: Track `isCameraReady`, `isOpponentReady`, and `isMatchCreated` separately to identify where the flow hangs.
- **Cleanup**: Call `supabase.removeChannel()` consistently in `useEffect` returns.
