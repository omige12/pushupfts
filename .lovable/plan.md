# Plan: Real Social System (ID, Friends, & Live Challenges)

Implement a functional, database-connected social system for "Flex Battle", replacing mock data with real user interactions.

## User-facing Changes
- **Permanent Player ID**: Visible and copyable on profile; searchable by others.
- **Friend Discovery**: Search area using Player ID to find real users (shows avatar, name, level, patent).
- **Friendship Lifecycle**: Send, receive, accept, and reject real friendship requests.
- **Social Dashboard**: "AMIGOS" section showing online status (🟢/🔴) based on real activity.
- **Live Challenges**: "DESAFIAR" button for online friends; sends real-time notifications.
- **Accept/Reject Battle**: Invite modal for recipients to join a shared competition session.
- **Social Ranking**: A dedicated tab in the Ranking view showing only the user and their added friends.

## Technical Details
- **Database Schema**: 
    - `profiles`: Add unique constraint on `player_id`.
    - `friendships`: Tracks `user_id`, `friend_id`, and `status` ('pending', 'accepted', 'rejected').
    - `challenges`: Tracks `challenger_id`, `challenged_id`, and `status`.
- **Real-time Logic**:
    - Use Supabase `last_seen_at` for online status (updated via heartbeat).
    - Real-time subscriptions for friendship requests and incoming challenge invites.
- **UI/UX**: 
    - Use existing "Neon Border" wrappers for social cards.
    - Implement instant feedback (75-100ms) for social actions.
    - Modal-based challenge alerts that interrupt the dashboard for immediate action.

## Implementation Steps
1. **Schema Finalization**: Ensure `friendships` and `challenges` tables are ready with proper RLS policies and GRANTS.
2. **Profile Logic**: Update profile fetching to include real-time online status heartbeats.
3. **Friendship System**: Implement search, request sending, and list management logic.
4. **Challenge System**: Build the invitation overlay and connect it to the existing `Challenge` component.
5. **Ranking Filter**: Add logic to filter the global ranking data by friend IDs.
6. **UI Integration**: Update the Dashboard and Profile views to surface the new features.
