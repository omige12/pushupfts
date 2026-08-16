# Plan for Quiz Stabilization, Home Screen Redesign, and UI Optimizations

Improve the stability and user experience of the Quiz screen, redesign the home screen action cards for better visual hierarchy and interaction speed, and refine overall app responsivity.

## Proposed Changes

### 1. Quiz Component Overhaul
- **Stability Fix**: Use `fixed` positioning for background elements and a `flex-1 overflow-y-auto` structure for content to prevent layout shifts during transitions and keyboard focus.
- **Data Security Card**: Add a specialized glassmorphism card at the bottom of the quiz content: "🔒 Seus dados estão seguros. Usamos essas informações apenas para personalizar seu treino."
- **Visual Refinement**: Standardize button heights and padding to ensure consistent touch targets.

### 2. Dashboard (Home Screen) Redesign
- **Premium Action Cards**: Replace current cards with high-fidelity `NeonFireWrapper` components for "PARTIDA RÁPIDA", "MISSÕES DIÁRIAS", and "MODO TREINO".
- **Enhanced Icons**: Increase icon size and add layered drop-shadows for a "3D neon" effect.
- **Fast Response Tap**: Implement `whileTap={{ scale: 0.94 }}` with a high-stiffness spring (100-180ms) for an immediate, tactile feel.
- **XP Centralization**: Ensure XP progress is prominently displayed within the gold neon wrapper.

### 3. PWA & UI Polish
- **Logo Consistency**: Ensure the new shield logo is used consistently across all views (Auth, Dashboard, Setup).
- **Responsive Sizing**: Use `clamp()` or fluid Tailwind units for font sizes to ensure text doesn't overlap on smaller mobile screens (iPhone SE/mini).
- **Safe Area**: Verify `.safe-area-padding` application in the root layout to handle notches and home indicators.

## Technical Details
- **Framer Motion**: Standardize `transition={{ type: "spring", stiffness: 400, damping: 25 }}` for tap effects to meet the 100-180ms requirement.
- **CSS Variables**: Refine `--radius` to `1.5rem` globally for a more modern, rounded aesthetic.
- **Supabase Integration**: Maintain existing profile upsert logic while ensuring the new `player_id` generation is robust.

## User Review Required
- Does the "electric-blue" and "energy-red" palette meet the desired neon intensity?
- Should the "MODO TREINO" card be full-width or side-by-side with "MISSÕES"? (Defaulting to full-width banner for visual variety).
