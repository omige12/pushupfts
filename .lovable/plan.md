# Plan: Daily Rewards and Missions System

Implement a fully functional daily reward and mission system with premium neon UI, integrated into the existing Flex Battle ecosystem.

## User Review Required
> [!IMPORTANT]
> The rewards for the 7-day streak are: XP (Day 1), Coins/XP (Day 2), XP + Coins (Day 3), Large XP (Day 4), Special Reward (Day 5), XP + Coins (Day 6), Premium Reward (Day 7).

## Proposed Changes

### Database & Backend
- Tables `daily_rewards` and `daily_missions` have been created via migration.
- RLS policies and GRANTs are configured for security.

### Features
#### Daily Rewards System
- Implement `DailyReward` view with 7-day progress tracker.
- Logic to handle consecutive days and streak resets.
- Reward claiming with animations (confetti, glow).
- Persistence in Supabase.

#### Daily Missions System
- Implement `DailyMissions` view with mission list and progress bars.
- Mission types: Pushups, Battles, Wins, XP, App Login.
- Automated mission generation per day.
- Real-time progress updates linked to `updateStats` function.

#### UI & UX
- Premium neon glassmorphism design.
- Micro-interactions (haptic-like pulses, border glow on tap).
- Centralized navigation and back-history support.

## Technical Details
- Using `framer-motion` for animations.
- `supabase-js` for real-time status and persistence.
- Integration into `Dashboard` for entry points.
- Global state updates for user stats (XP, level) after resgating rewards.
