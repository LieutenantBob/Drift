You are iteratively building and verifying Drift — a contemplative
journalling app where a Murmuration canvas (boid flocking simulation)
responds to the user's writing in real time.

This is a Ralph Loop. Each iteration you will:
  1. Read the current state of the codebase
  2. Run the verification suite below
  3. Fix the highest-priority failing item
  4. Only output <promise>COMPLETE</promise> when every item passes

Do not output the promise unless everything genuinely passes.
Do not fix multiple things at once. One fix per iteration.


── WHAT EXISTS ──────────────────────────────────────────────────────────────

The project was scaffolded from the Drift v3 prompt. Check what is
actually present before assuming anything. Read these files first:

  - package.json          (verify dependencies are installed)
  - app/_layout.tsx       (verify fonts load, navigation shell exists)
  - types/index.ts        (verify WritingMetrics, CanvasParams, Theme,
                           JournalEntry interfaces are defined)
  - components/canvas/MurmurationCanvas.tsx
  - components/canvas/useCanvasEngine.ts
  - lib/themes/murmuration.ts
  - lib/writingMetrics.ts
  - store/sessionStore.ts
  - store/archiveStore.ts
  - app/session/[id].tsx
  - app/(tabs)/archive.tsx
  - constants/colors.ts
  - constants/prompts.ts

If any of these files are missing or empty, create them before running
verification. Do not assume they exist — check with Read first.


── VERIFICATION SUITE ────────────────────────────────────────────────────────

Run ALL of these checks each iteration. Record pass/fail in
.claude/drift-status.md before deciding what to fix.

── CHECK 1: TypeScript clean ──────────────────────────────────────────────

  Command: npx tsc --noEmit
  Pass: exit code 0, zero errors
  Fail: any TypeScript error

  If failing: fix the TypeScript errors before anything else.
  Do not proceed to other checks until this passes.

── CHECK 2: Boid engine is correct ───────────────────────────────────────

  Create and run this test script each iteration:

    node -e "
    const { initBoids, stepBoids } = require('./lib/themes/murmuration.ts');
    // Use ts-node if .ts, or check if compiled .js exists

    // Test 1: Init produces correct count
    const boids = initBoids(80, 390, 844);
    console.assert(boids.length === 80, 'FAIL: wrong boid count');
    console.assert(boids[0].x >= 0 && boids[0].x <= 390, 'FAIL: x out of bounds');
    console.assert(boids[0].y >= 0 && boids[0].y <= 844, 'FAIL: y out of bounds');

    // Test 2: Step changes positions
    const params = { particleCount:80, speed:0.5, colourTemperature:0.5,
                     cohesion:0.5, turbulence:0.0 };
    const next = stepBoids(boids, params, 390, 844);
    const moved = next.some((b,i) => b.x !== boids[i].x || b.y !== boids[i].y);
    console.assert(moved, 'FAIL: boids did not move after step');

    // Test 3: High turbulence changes behaviour vs low turbulence
    const paramsLow  = { ...params, turbulence: 0.0 };
    const paramsHigh = { ...params, turbulence: 1.0 };
    const nextLow  = stepBoids(boids, paramsLow,  390, 844);
    const nextHigh = stepBoids(boids, paramsHigh, 390, 844);
    const diffCount = nextLow.filter((b,i) =>
      Math.abs(b.vx - nextHigh[i].vx) > 0.001 ||
      Math.abs(b.vy - nextHigh[i].vy) > 0.001
    ).length;
    console.assert(diffCount > 0, 'FAIL: turbulence has no effect');

    console.log('Boid engine: PASS');
    "

  If this test cannot run because murmuration.ts is not importable as
  CommonJS, use ts-node:
    npx ts-node -e "[same code]"

  Or extract the pure functions to a testable helper and run them there.

  Pass: all three assertions pass, prints "Boid engine: PASS"
  Fail: any assertion fails

── CHECK 3: WritingMetrics computation is correct ─────────────────────────

  Run this inline test:

    npx ts-node -e "
    import { metricsToCanvasParams } from './lib/writingMetrics';

    // Low activity: paused for 8+ seconds, few words
    const lowMetrics = {
      wpm: 0,
      wordCount: 5,
      avgSentenceLength: 10,
      punctuationDensity: 0.1,
      timeSinceLastKeystroke: 9000
    };
    const lowParams = metricsToCanvasParams(lowMetrics);
    console.assert(lowParams.speed < 0.1,
      'FAIL: low WPM should produce low speed, got ' + lowParams.speed);
    console.assert(lowParams.turbulence > 0.9,
      'FAIL: 9s pause should produce high turbulence, got ' + lowParams.turbulence);
    console.assert(lowParams.particleCount <= 100,
      'FAIL: 5 words should produce low particle count, got ' + lowParams.particleCount);

    // High activity: fast typing
    const highMetrics = {
      wpm: 80,
      wordCount: 200,
      avgSentenceLength: 8,
      punctuationDensity: 0.3,
      timeSinceLastKeystroke: 100
    };
    const highParams = metricsToCanvasParams(highMetrics);
    console.assert(highParams.speed >= 0.9,
      'FAIL: 80 WPM should produce speed ~1.0, got ' + highParams.speed);
    console.assert(highParams.turbulence < 0.1,
      'FAIL: 100ms pause should produce low turbulence, got ' + highParams.turbulence);
    console.assert(highParams.particleCount > 200,
      'FAIL: 200 words should produce high particle count, got ' + highParams.particleCount);
    console.assert(highParams.colourTemperature > 0.8,
      'FAIL: fast writing should produce warm colour, got ' + highParams.colourTemperature);

    console.log('WritingMetrics mapping: PASS');
    "

  Pass: all assertions pass
  Fail: any assertion fails

  EXPECTED MAPPINGS (fix the mapping function if these are wrong):
    speed         = Math.min(wpm / 80, 1.0)
    turbulence    = Math.min(timeSinceLastKeystroke / 8000, 1.0)
    particleCount = Math.round(80 + (400 - 80) * Math.min(wordCount / 300, 1.0))
    colourTemp    = speed
    cohesion      = Math.min(punctuationDensity * 4, 1.0)

── CHECK 4: useSmoothParams lerps correctly ──────────────────────────────

  This is harder to test in isolation because it uses React hooks.
  Instead, verify the implementation by reading the source:

  Read: lib/writingMetrics.ts (or wherever useSmoothParams lives)
  Verify that:
    a. It uses a useRef to store current values between renders
    b. The lerp factor is between 0.03 and 0.06 (inclusive)
    c. It calls requestAnimationFrame in a useEffect
    d. It cleans up (cancels RAF) on unmount
    e. It updates state with the lerped values

  If any of a–e are wrong, fix the implementation.
  Pass: all five points are satisfied by reading the source

── CHECK 5: App builds without errors ────────────────────────────────────

  Command: npx expo export --platform ios 2>&1 | tail -20

  Pass: "Export was successful" or equivalent success message
  Fail: any build error

  Note: This is slower than tsc --noEmit. Run it only after CHECK 1
  passes. If CHECK 1 passes but CHECK 5 fails, there is likely a
  runtime import error or a missing asset.

── CHECK 6: Simulator boot and app launch ────────────────────────────────

  Commands (run in sequence):

    # Check if simulator is booted
    xcrun simctl list devices booted | grep iPhone

    # If nothing booted, boot one:
    xcrun simctl boot "iPhone 15 Pro" && sleep 5

    # Build and install:
    npx expo run:ios --device "iPhone 15 Pro" 2>&1 | tail -30

    # Wait for launch:
    sleep 8

    # Check for crash (look for crash in last 60 seconds):
    xcrun simctl spawn booted log stream \
      --predicate 'eventMessage contains "fatal" or eventMessage contains "crash"' \
      --style compact 2>/dev/null &
    LOGPID=$!
    sleep 3
    kill $LOGPID 2>/dev/null

    # Capture launch screenshot:
    xcrun simctl io booted screenshot /tmp/drift-launch.png
    echo "Screenshot saved to /tmp/drift-launch.png"

  Pass: app installs, launches, no crash in log stream, screenshot captured
  Fail: build fails, crash detected, or launch screenshot is black

  If the screenshot is black: the app crashed silently. Check Metro logs.
  If build fails: there is a native module issue. Check that
    react-native-skia and expo-router are correctly in app.config.ts plugins.

── CHECK 7: Session screen visual structure ──────────────────────────────

  After CHECK 6 passes and the app is on screen:

  Navigate to the session screen. On a fresh install, the app should
  open to the intention/onboarding screen. Tap 'Begin':

    # Tap approximately where 'Begin' button should be
    # (bottom centre of screen on iPhone 15 Pro: 390, 750)
    xcrun simctl io booted tap 390 750
    sleep 3

    # Capture session screen
    xcrun simctl io booted screenshot /tmp/drift-session.png

  Now analyse the screenshot at /tmp/drift-session.png:

  Read the file and assess:
    a. The background is very dark (close to #0A090F)
    b. There is visible particle/boid animation content in the canvas area
       (the image is not uniformly dark — there is variation in pixels)
    c. There is a text input area visible in the bottom ~35% of the screen
    d. There is NO visible status bar at the top
    e. There is NO visible navigation header

  You cannot run vision analysis, so instead:
    — Check the file size of the screenshot. A uniformly black screen
      will be small (PNG compresses solid colour well). A visually rich
      canvas will be larger. If the file is under 50KB, the canvas may
      be blank.
    — Check the Metro console output for render errors

    ls -la /tmp/drift-session.png
    # If size < 50000 bytes: canvas is likely blank

    # Check for JS errors in the last 30 seconds of logs:
    xcrun simctl spawn booted log stream \
      --predicate 'process == "drift" and messageType == "error"' \
      --style compact 2>/dev/null &
    LOGPID=$!
    sleep 5
    kill $LOGPID 2>/dev/null

  Pass: screenshot > 50KB (canvas is rendering), no JS errors in log
  Fail: screenshot < 50KB, or JS errors present

── CHECK 8: Canvas responds differently to typing patterns ───────────────

  This is the core product verification. The canvas must look different
  after slow contemplative typing vs fast urgent typing.

  STEP A: Slow typing simulation (contemplative pattern)

    # Navigate to a fresh session (kill and relaunch if needed)
    xcrun simctl terminate booted com.drift.journal 2>/dev/null; sleep 1
    xcrun simctl launch booted com.drift.journal; sleep 6
    xcrun simctl io booted tap 390 750; sleep 3  # tap Begin

    # Type slowly with pauses — 5 words, then a 5-second pause, repeat
    # Use AppleScript to send keystrokes
    osascript -e 'tell application "Simulator" to activate'

    # Send slow typing sequence with pauses
    for word in "the" "conversation" "I" "keep" "avoiding"; do
      osascript -e "tell application \"System Events\" to keystroke \"$word \""
      sleep 2
    done
    sleep 5  # Long pause — should produce turbulence
    for word in "it" "is" "not" "that" "I"; do
      osascript -e "tell application \"System Events\" to keystroke \"$word \""
      sleep 2
    done

    # Capture canvas after slow typing
    xcrun simctl io booted screenshot /tmp/drift-slow.png
    ls -la /tmp/drift-slow.png

  STEP B: Reset and fast typing simulation (urgent pattern)

    xcrun simctl terminate booted com.drift.journal 2>/dev/null; sleep 1
    xcrun simctl launch booted com.drift.journal; sleep 6
    xcrun simctl io booted tap 390 750; sleep 3  # tap Begin

    osascript -e 'tell application "Simulator" to activate'

    # Send fast typing with almost no pauses
    FASTTEXT="whatwouldyoudoifyouwerentafraidofwastingtime theproblemis Ihavebeenrehearsing thissolong itsoundsliketheatre nowevento me"
    for word in $FASTTEXT; do
      osascript -e "tell application \"System Events\" to keystroke \"$word \""
      sleep 0.2
    done

    # Capture canvas after fast typing
    xcrun simctl io booted screenshot /tmp/drift-fast.png
    ls -la /tmp/drift-fast.png

  STEP C: Compare the two screenshots

    # Use ImageMagick to compute difference
    # Install if needed: brew install imagemagick
    compare -metric PSNR \
      /tmp/drift-slow.png \
      /tmp/drift-fast.png \
      /tmp/drift-diff.png 2>&1

  Pass: PSNR value is below 30 (the two screenshots are meaningfully
        different — the canvas responded to the different typing patterns)
  Fail: PSNR is above 30 (the canvas looks nearly identical regardless
        of typing pattern — the metrics are not reaching the canvas)

  Also check file sizes: both screenshots should be > 50KB.

  If PSNR > 30, diagnose:
    — Add a temporary console.log to useCanvasEngine.ts:
        console.log('params:', JSON.stringify(params))
      Run a session, check Metro for the log. Are params changing?
    — If params are constant: WritingMetrics is not being computed.
      Check WritingField.tsx — is onChangeText calling the metrics hook?
    — If params change but canvas doesn't: useSmoothParams may be
      returning the same value. Check the lerp is actually updating state.

── CHECK 9: Entry saved and visible in archive ───────────────────────────

  After a typing session:

    # Let a 5-minute timer expire, OR tap 'end session' if visible
    # For testing, trigger session end by tapping the end button
    # (varies by implementation — look for it at approximately 390, 120)
    xcrun simctl io booted tap 390 120; sleep 2  # tentative end button position
    sleep 4  # wait for done state and navigation

    # Navigate to archive tab (bottom right tab, approximately)
    xcrun simctl io booted tap 390 880; sleep 2  # tab bar
    xcrun simctl io booted screenshot /tmp/drift-archive.png
    ls -la /tmp/drift-archive.png

  Pass: archive screenshot > 50KB (entry is visible, not a blank screen)
        The archive tab shows at least one entry card.
  Fail: archive is blank, or the app crashed during session end.

  If blank: check archiveStore.addEntry() is being called when session ends.
  If crash: check makeImageSnapshot() — it may fail if the canvas ref
    is null at the time of capture. Add a null check and fallback.

── CHECK 10: Persistence after kill/relaunch ─────────────────────────────

  After CHECK 9 passes (at least one entry exists):

    # Kill the app
    xcrun simctl terminate booted com.drift.journal
    sleep 2

    # Relaunch
    xcrun simctl launch booted com.drift.journal
    sleep 6

    # Navigate directly to archive
    xcrun simctl io booted tap 390 880; sleep 2
    xcrun simctl io booted screenshot /tmp/drift-persist.png
    ls -la /tmp/drift-persist.png

  Pass: screenshot > 50KB — the entry survived the kill/relaunch
  Fail: archive is empty after relaunch — AsyncStorage is not persisting

  If failing: check archiveStore.ts — does it read from AsyncStorage
  on initialisation? The Zustand store must hydrate from AsyncStorage
  when the store is first accessed, not just write to it on save.


── STATUS FILE ──────────────────────────────────────────────────────────────

  At the start of each iteration, update .claude/drift-status.md:

    # Drift Development Status
    Last updated: [timestamp]
    Iteration: [N]

    | Check | Status | Note |
    |-------|--------|------|
    | 1. TypeScript | ✅ PASS / ❌ FAIL | [brief note] |
    | 2. Boid engine | ✅ PASS / ❌ FAIL | [brief note] |
    | 3. WritingMetrics | ✅ PASS / ❌ FAIL | [brief note] |
    | 4. useSmoothParams | ✅ PASS / ❌ FAIL | [brief note] |
    | 5. Expo build | ✅ PASS / ❌ FAIL | [brief note] |
    | 6. Sim launch | ✅ PASS / ❌ FAIL | [brief note] |
    | 7. Session screen | ✅ PASS / ❌ FAIL | [brief note] |
    | 8. Canvas responds | ✅ PASS / ❌ FAIL | [PSNR: X] |
    | 9. Archive entry | ✅ PASS / ❌ FAIL | [brief note] |
    | 10. Persistence | ✅ PASS / ❌ FAIL | [brief note] |

    ## This iteration
    **Fixing:** [description of the single fix being made]
    **Root cause:** [why this check is failing]
    **Expected result:** [what should change next iteration]

    ## Fix history
    [Running log of all fixes made across iterations]


── FIX PRIORITY ORDER ───────────────────────────────────────────────────────

  When multiple checks fail, fix the highest-priority failing check only.

  Priority 1 — CHECK 1 (TypeScript)
    Nothing else can be verified reliably if types are broken.

  Priority 2 — CHECK 2 (Boid engine)
    The engine is pure logic. If it is wrong, the canvas will never
    respond correctly no matter what else is fixed.

  Priority 3 — CHECK 3 (WritingMetrics mapping)
    The mapping must be correct before the canvas can respond to typing.
    If the numbers going in are wrong, nothing downstream can be right.

  Priority 4 — CHECK 4 (useSmoothParams)
    If this is wrong, params snap instead of transitioning — the canvas
    will look jittery and the aesthetic north star is violated.

  Priority 5 — CHECK 5 (Expo build)
    Fix native module issues, missing assets, bad imports.

  Priority 6 — CHECK 6 (Simulator launch)
    Fix crash-on-launch issues.

  Priority 7 — CHECK 8 (Canvas responds to typing)
    This is the highest-value product behaviour. Once it works,
    everything else is refinement.

  Priority 8 — CHECK 7 (Session screen structure)
    Visual polish — correct structure, no unwanted chrome.

  Priority 9 — CHECK 9 (Archive)
    Entry persistence to the session-level store.

  Priority 10 — CHECK 10 (Across-launch persistence)
    AsyncStorage hydration on app restart.


── QUALITY PASS ─────────────────────────────────────────────────────────────

  When all 10 checks pass, do ONE quality-improvement iteration before
  outputting the completion promise. Read the code and fix whichever of
  these is most wrong:

  Q1 — Lerp factor
    Read lib/writingMetrics.ts. Is the lerp factor between 0.04–0.06?
    If it is at 0.05, leave it. If it is outside this range, set it to 0.05.

  Q2 — Ghost trail alpha
    Read components/canvas/MurmurationCanvas.tsx.
    Find the Rect that draws the ghost trail. Its colour alpha should be
    approximately 0.28 (e.g. "rgba(8,7,14,0.28)").
    If it is significantly different, adjust to 0.28 and re-run CHECK 8.

  Q3 — Particle count range
    The defaultParams for the Murmuration theme should have particleCount: 80.
    The maximum (at 300+ words) should be 400.
    Read lib/writingMetrics.ts and verify the mapping formula:
      particleCount = Math.round(80 + 320 * Math.min(wordCount / 300, 1.0))
    If wrong, correct it.

  Q4 — Intention text fade
    Read app/session/[id].tsx. The intention text must fade to opacity 0
    after exactly 10 seconds using Animated.timing. Verify:
      setTimeout starts when the session screen mounts
      Duration of fade: 1500ms
      Delay before fade: 10000ms
      useNativeDriver: true
    If any of these are wrong, fix them.

  Q5 — Status bar hidden
    Read app/session/[id].tsx. Verify that <StatusBar hidden={true} />
    is present on the session screen. If not, add it.

  After fixing the worst quality issue, update .claude/drift-status.md
  with a Quality Pass section. Then output the completion promise.


── AESTHETIC NORTH STAR ─────────────────────────────────────────────────────

  Every fix you make should be evaluated against this:

  The session screen has exactly three visible things:
    — The writing field (bottom ~35%, transparent background)
    — The timer ring (bottom-right corner, 44px, barely visible)
    — The intention text (top-centre, fades after 10 seconds)
  The canvas fills everything else.

  The canvas never stops moving. Even at rest (no typing, long pause),
  the boids drift slowly due to turbulence. The canvas is alive.

  The canvas looks different at WPM=5 than at WPM=65. If it doesn't,
  CHECK 8 will fail and you must fix the metrics pipeline.

  The archive is a gallery. Each card is the frozen canvas thumbnail.
  No borders on cards. No row separators. Dates are small and muted.


── COMPLETION ────────────────────────────────────────────────────────────────

  Output this ONLY when:
    ✅ All 10 checks pass
    ✅ The quality pass has run and the worst quality issue is fixed
    ✅ .claude/drift-status.md shows all green

  <promise>COMPLETE</promise>

  After the promise, write a brief summary:
    — Total iterations taken
    — The three most significant fixes made
    — Final PSNR diff value from CHECK 8
    — Any known limitations that would need to be addressed in Session 2

