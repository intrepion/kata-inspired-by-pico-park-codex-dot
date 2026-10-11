# Together, Little Lights

An original bright, bite-size cooperative puzzle-platformer about two lantern creatures restoring six floating gardens. Inspired by the joy of shared-screen teamwork; all characters, layouts, procedural art and synthesized sound are original.

**Play on this Mac: http://127.0.0.1:5178/**

Default is **local two-player keyboard co-op**, on one screen. There is no online multiplayer or public deployment. Solo switching and touch controls make every garden playable alone.

| Friend | Move | Jump | Light |
| --- | --- | --- | --- |
| Sol (gold) | A / D | W | E |
| Luna (violet) | ← / → | ↑ | Enter |

In solo mode either scheme controls the selected friend; **Tab** or **Swap** switches. The parked friend remains still. Escape pauses, R restarts. While paused, Tab navigates DOM controls normally. Beacons stay lit and the shared key stays collected after a fall. Both friends must reach the arch with all beacons lit and the key found. Push the rolling planter with movement; hop onto it to reach the high light.

Mute and reduced-motion controls are in the header. Sound starts off. Garden unlocks save locally; unavailable/corrupt storage safely falls back to the first garden. Phone buttons support solo movement, jump, light, and switching; landscape offers a larger game view.

## Development

Node 24 or newer. No runtime dependencies or remote asset requests.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm audit --audit-level=high
```

The game uses strict TypeScript, a 120Hz fixed simulation, coyote time, jump buffering, and a queued input latch. Frame catch-up is capped at 100ms so an interrupted tab cannot launch a large physics burst. Simulation, input buffering, frame clock, rendering and UI have distinct boundaries. Creatures pass through each other; stacking is intentionally absent. Planters cannot leave their rail or be pushed through the other creature.

## Current-session server

The production preview uses the user launchd job `com.intrepion.little-lights`, loopback-only port **5178**. It remains independent of this task for the current macOS login session. No LaunchAgents plist, boot/login persistence, security change, or public host is configured. Logout/reboot may end the job; after the next login, run the start command again. A process crash is handled by launchd while the submitted job remains registered.

Start after building:

```sh
cd /Users/intrepion/Documents/Codex/2026-10-10/task-6/kata-inspired-by-pico-park-codex-dot
npm run build
./scripts/start-session.sh
```

Restart a registered session job:

```sh
launchctl remove com.intrepion.little-lights
./scripts/start-session.sh
```

Stop: `launchctl remove com.intrepion.little-lights`. Inspect: `launchctl list com.intrepion.little-lights`. Logs: `server.log`. Ordinary foreground fallback: `npm run preview`. Other projects and ports 5173–5177 are untouched.

## Verification

See [QA evidence](docs/QA.md), [specification](docs/SPEC.md), [glossary](CONTEXT.md), [decision](docs/adr/0001-cooperative-solo.md), and [independent reviews](docs/REVIEWS.md). CI runs type checks, the full behavior suite, production build and dependency audit.

All six stages were completed through normal visible Chrome keyboard controls on this Mac, including the revised planter puzzle. Automated simulation routes independently cover all six stages. This is not a physical two-person keyboard-rollover test or a physical phone multitouch test. Browser audio controls were exercised; actual speaker listening was not verified. These limitations are deliberate and accurately reported.
