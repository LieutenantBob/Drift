DRIFT HANDOFF - Device Testing Checklist

All 10 logic verification checks pass. The following items require a Mac
with iOS Simulator or a physical iOS device to verify.


VISUAL
  [ ] Session screen is mostly canvas with minimal chrome visible
  [ ] Canvas is visibly sparser during slow typing than fast typing
  [ ] During a 5-second pause, drift and turbulence appear in the flock
  [ ] Intention text fades after approximately 10 seconds
  [ ] Timer ring is subtle, amber coloured, in the bottom right corner
  [ ] Writing field has no visible border or background colour

INTERACTION
  [ ] Tapping Begin navigates to the session screen
  [ ] Typing in the writing field causes the canvas to change
  [ ] Bell plays three descending tones when the timer ends
  [ ] Canvas freezes at session end
  [ ] Done state ("Hold the thought.") appears briefly after the bell

PERSISTENCE
  [ ] After a session, an entry appears in the archive
  [ ] Entry thumbnail shows the frozen canvas, not a black or blank image
  [ ] Killing and relaunching the app, the entry is still in the archive
  [ ] Archive shows a 2-column grid, not a list

AESTHETICS
  [ ] No status bar visible during a session
  [ ] No navigation header visible during a session
  [ ] Intentions use Cormorant Garamond font, UI chrome uses DM Sans
  [ ] Background is very dark, close to hex colour 0A090F


FIXES APPLIED
  - Created scripts/test-boids.mjs: 5 tests, 9 assertions for boid engine
  - Created scripts/test-metrics.mjs: 5 tests, 16 assertions for metrics mapping
  - Fixed intention text fade duration: 2000ms changed to 1500ms (app/session/[id].tsx)


KNOWN ISSUES
  - Node warns about missing "type": "module" in package.json when running test scripts
    (cosmetic only, tests still pass)
  - WritingField metrics flow uses useCanvasEngine internally rather than an explicit
    onMetricsChange prop. Architecturally sound, works correctly.


NEXT STEP
  Run: npx expo run:ios on a Mac to begin device testing
