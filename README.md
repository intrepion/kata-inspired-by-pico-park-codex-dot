# Together, Little Lights

An original bright, bite-size cooperative puzzle-platformer about two lantern creatures restoring six floating gardens. Inspired by the joy of shared-screen teamwork; all characters, layouts, procedural art and synthesized sound are original.

**Play on this Mac: http://127.0.0.1:5178/**

Default is **local two-player keyboard co-op**, on one screen. There is no online multiplayer or public deployment. Solo switching and touch controls make every garden playable alone.

| Friend | Move | Jump | Light |
| --- | --- | --- | --- |
| Sol (gold) | A / D | W | E |
| Luna (violet) | ← / → | ↑ | Enter |

In solo mode either scheme controls the selected friend; **Tab** or **Swap** switches. The unselected friend receives no movement input, but can be carried as a rider. Escape pauses, R restarts. While paused, Tab navigates DOM controls normally. Beacons stay lit and the shared key stays collected after a fall. Both friends must reach the arch with all beacons lit and the key found. Push the rolling planter with movement; hop onto it to reach the high light.

**Stack together:** jump onto a friend's head to stand on them. The base carries the rider while walking or jumping; the rider can move or jump off independently. Friends block each other at the sides, so hop over a parked friend rather than walking through. Walls and ceilings stop a stack before crushing either friend. If someone occupies a fall-recovery spawn, the returning friend appears at the nearest free side position. Try stacking in the first garden: briefly hold W + D, release, and land Sol on Luna; then move Luna with →. In solo, switch to Luna with Tab before moving the base.

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

The game uses strict TypeScript, a 120Hz fixed simulation, coyote time, jump buffering, and a queued input latch. Frame catch-up is capped at 100ms so an interrupted tab cannot launch a large physics burst. Simulation, input buffering, frame clock, rendering and UI have distinct boundaries. Teammate bodies are solid and can support/carry one another. Swept axis movement stops at the nearest surface; a blocked rider limits base movement. Planters cannot leave their rail or be pushed through the other creature. The six garden layouts and version-1 progress saves are unchanged.

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

The original six-stage version was completed through normal visible Chrome keyboard controls on this Mac, including the planter puzzle. The stacking change has 35 passing simulation/input/clock tests, including updated legitimate solo routes through all six unchanged stages, wall/ceiling safety, both friend roles, occupied-spawn recovery and equal stack movement at 30Hz/144Hz. Fresh stacking browser verification is tracked separately in [QA](docs/QA.md); the historical playthrough is not evidence of this new mechanic. This is not a physical two-person keyboard-rollover test or a physical phone multitouch test. Browser audio controls were exercised historically; actual speaker listening was not verified.
