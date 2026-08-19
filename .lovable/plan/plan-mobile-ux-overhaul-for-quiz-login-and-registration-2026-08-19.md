# Plan - Mobile UX Overhaul for Quiz, Login, and Registration

Improve the mobile experience for Quiz, Auth, and Profile Setup views in FlexBattle, focusing on vertical balance, consistent button alignment, and neon animations.

## User Review Required

> [!IMPORTANT]
> - New animated neon borders will be added to primary buttons.
> - Layout will be strictly vertically centered for mobile devices.
> - All buttons will be resized and aligned for optimal tactile response on smartphones.

## Proposed Changes

### Styling & Animation (`src/styles.css`)
- Define new `@utility` classes for animated neon borders (`neon-border-animated`).
- Add specific glow and pulse effects for active/tap states.

### Quiz Component (`src/routes/index.tsx`)
- **Layout**: Use `flex-col justify-between` or `justify-center` with balanced spacing to remove empty space at the bottom.
- **Card**: Centralize question cards, adjust width to `max-w-sm` (90% of screen), and refine neon glow.
- **Progress Bar**: Centralize "Question X of Y" and percentage, add smooth 250ms transitions.
- **Buttons**: Equalize button widths, centralize alignment, and apply new neon animations.
- **Performance**: Optimize transitions using `AnimatePresence` and `memo` where applicable to ensure 60fps on mobile.

### Auth View (Login/Signup) (`src/routes/index.tsx`)
- **Centralization**: Vertically center the entire auth container.
- **Inputs**: Increase height and padding for better finger-tap targeting.
- **Buttons**: Apply the same consistent width and neon animation as the quiz.
- **Identity**: Ensure Electric Blue palette is strictly followed (no green).

### Onboarding & Profile Setup (`src/routes/index.tsx`)
- Apply mobile-first layout adjustments to `PhotoUpload`, `ProfileSetup`, and `ProfileReady`.
- Ensure consistent input sizing and button styles across the entire flow.

## Technical Details

- Use `framer-motion` for all layout transitions to maintain hardware-accelerated performance.
- Implement CSS-only animations for neon borders to minimize JS main-thread load.
- Use `env(safe-area-inset-*)` variables in the `safe-area-padding` class to respect notch/home-bar areas.
- Standardize button widths to `w-full max-w-[320px]` where appropriate.
