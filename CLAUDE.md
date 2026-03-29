# Drift

Contemplative journalling app where a generative art canvas responds to writing in real time.

## Commands

```bash
# Install
npm install

# Run (requires custom dev client, NOT Expo Go)
npx expo run:ios

# TypeScript check
npx tsc --noEmit
```

## Architecture

React Native (Expo SDK 51) + react-native-skia + Expo Router v3 + Zustand.

**Core loop:** intention → timed session → live canvas → bell → frozen canvas archived

### Key Boundaries

| Layer | Location | Purpose |
|-------|----------|---------|
| Types | `types/index.ts` | All shared interfaces |
| Canvas | `components/canvas/` | Skia rendering + engine hook |
| Boid Engine | `lib/themes/murmuration.ts` | Pure TS simulation, no React |
| Theme Registry | `lib/themes/index.ts` | Track A + Track B themes |
| Metrics | `lib/writingMetrics.ts` | Text → WritingMetrics → CanvasParams |
| Stores | `store/` | Zustand (session + archive with AsyncStorage) |
| Session UI | `components/session/` | Intention, writing field, timer, bell |
| Archive UI | `components/archive/` | Entry card + grid |
| Screens | `app/` | Expo Router file-based navigation |

### Two-Track Theme System

- **Track A (Permanent Collection):** In-house themes, always available. Session 1: Murmuration only.
- **Track B (Gallery):** Artist collaborations, limited editions. Stubbed in registry.

## Conventions

- All transitions: opacity fade, 300-500ms, ease-in-out. No spring animations.
- Personal content → Cormorant Garamond. Structural chrome → DM Sans. Data → DM Mono.
- Canvas is always present. The visual IS the product.
- Immutable state updates (Zustand).
- Stubs for: Supabase, encryption, RevenueCat (Session 2+).
