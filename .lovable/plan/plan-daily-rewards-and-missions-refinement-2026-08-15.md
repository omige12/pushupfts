# Plan: Daily Rewards and Missions Refinement

Refine the Daily Rewards and Missions systems to ensure persistent resgates, real-time daily resets with a neon countdown timer, and automated "Enter App" mission completion.

## Database Changes
- Add `last_login_at` to the `profiles` table to track daily entries.
- Ensure the `increment_mission_progress` RPC handles the "login" type correctly.
- *Note: Table schemas for `daily_rewards` and `daily_missions` are already in place from the previous turn.*

## Technical Details

### 1. Daily Rewards Correction
- **Resgate Logic**: Fix the `claimReward` function to ensure it updates both `daily_rewards` and `profiles` (XP/XP levels) correctly using Supabase.
- **Visual Feedback**: Update the button state to "RESGATADA HOJE ✓" and trigger a celebration animation with confetti.
- **Daily Persistence**: Use a combination of `last_claimed_at` from the database and a server-time offset (or reliable client-side UTC) to determine if a new day has started.

### 2. Daily Missions Overhaul
- **"Enter FlexBattle" Mission**: Force this mission to be the first in the list and auto-complete it by calling the `increment_mission_progress` RPC when the dashboard loads or when the missions view is opened.
- **Countdown Timer**: Implement a 24-hour countdown `TimeRemaining` component that calculates the time until the next UTC midnight (or local midnight, configurable).
- **Neon HUD**: Style the countdown inside a `NeonFireWrapper` card with glowing borders, tabular numbers, and a premium HUD aesthetic.
- **Auto-Reset**: When the countdown reaches `00:00:00`, trigger a re-fetch of missions which will generate new ones for the new date.

### 3. UI Refinements
- **Neon Borders**: Apply consistent neon glow effects to all mission cards and reward slots.
- **Navigation**: Ensure the "Back" button correctly returns to the previous view using the established `goBack` logic.

## User Experience
- The user will see a live countdown for when new challenges appear.
- The "Enter App" mission will provide instant gratification every day.
- Reward claiming will be robust and clearly communicated through UI state changes.
