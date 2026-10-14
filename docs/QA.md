# Verification evidence

The original sections below record the 2026-10-10/11 implementation before solid teammate bodies. They remain historical evidence, not a fresh browser pass for the 2026-10-14 stacking fix. Current verification is at the end.

## Skill workflow

Read local `/Users/intrepion/.agents/skills/{grill-with-docs,implement,grilling,domain-modeling,tdd,code-review}/SKILL.md`, domain context/ADR formats and TDD tests/mocking references. Compared the current official Grill with Docs and Implement sources at https://github.com/mattpocock/skills/tree/main/skills/engineering. Personal Codex skills were inspected; the available imagegen/pet/docs skills were unnecessary for original procedural game art. The no-interview adaptation and public test seams are recorded in SPEC.md.

Actual red → green slices: invalid stage loading failed on missing spawns, then fallback validation passed; short-tap input-buffer test failed before the public module existed, then passed with the latch; fixed-clock tests failed before the module existed, then passed with 120Hz accumulation/catch-up cap; planter push/reset/no-crush tests failed before world planter state existed, then passed after implementation. Additional gameplay and campaign tests were regression/spec coverage after implementation; they are not falsely claimed as test-first. Initial movement test had an incorrect one-second distance threshold, corrected using the independent 220px/s worked expectation. Initial dependency/tsx-pipe failures were environment issues, not TDD reds.

## Tests

23 passing Node test-runner behavior tests at simulation/input/clock boundaries:
- All six authored campaign routes complete in legitimate solo command sequences with both friends and no falls.
- Independent simultaneous movement, solid landing, buffered, coyote and held jump behavior.
- Role-specific persistent lights and closed/open gates.
- Shared-key retention after falling; complete fresh reset.
- Portal requires both friends, key and all lights; simulation completion is idempotent.
- Player crossing without pushing/crushing.
- Untrusted save validation.
- Short tap latching and clearing queued/held inputs.
- Equal one-second movement at 30Hz and 144Hz; capped long interruption and accumulator reset.
- Planter pushes to rail stop, resets, and blocks instead of crushing the other friend.

## Chrome playthrough on the Mac

Used the supported CUA browser tool and normal held keyboard chords/clicks, with screenshots and accessibility state inspection. No console evaluation, state injection, teleportation, or unlocking shortcuts were used.

| Garden | Visible result |
| --- | --- |
| A spark between us | Shared key, both at arch, Garden 1 restored |
| Sun & moon | Both role lights, gate opens, Garden 2 restored |
| The winding orchard | High sun/lower moon, sequential gates, Garden 3 restored |
| Across the quiet water | Platform crossing, retained team key, Garden 4 restored |
| The rolling planter | Luna route light; Sol pushes/climbs planter; high light; Luna collects key; Garden 5 restored |
| The garden wakes | Four role lights and shared key, Garden 6 restored / Look what we grew |

Both keyboard schemes exercised in solo. Default local co-op garden one was also completed by independently controlling both friends. Simultaneous four-key movement/jump exercised in local co-op. Pause rejects movement; replay/restart reset lights/key; completion → Gardens → Back restores completion. Reload retained unlocks (all six garden buttons enabled after campaign). Touch move/jump/swap exercised in 390×844 responsive Chrome view, with desktop viewport restored. Mobile clipping was found and fixed, then re-inspected. Headings/buttons are DOM-based with visible keyboard focus.

The final two added regression cases explicitly check a missing key/missing light at the exit and coyote jumping just after leaving a ledge.

Screenshots: [local co-op](evidence/co-op.jpg), [planter](evidence/planter.jpg), [finale](evidence/finale.jpg), [phone menu](evidence/mobile-menu.jpg), [phone play](evidence/mobile-play.jpg).

## Limitations

The original build had no online networking or stacking; stacking is now implemented as described below. No physical two-person keyboard-rollover or physical mobile multitouch session. Small portrait screen makes the playfield compact; landscape recommended. Sound is synthesized feedback only; speaker output not listened to. Session server requires restart after logout/reboot and is loopback-only. Sidebar project registration is unavailable through the supported tools in this environment.

Final presentation retest: desktop menus and playfield fit the current Chrome viewport. Focused Sound/Motion controls activate with Enter through their normal DOM behavior (sound on and motion reduced both visibly confirmed), then reload restores default mute/start screen. Default local co-op garden one completed with independent Sol and Luna controls. Final suite: 23/23 passing; production build and type checking pass; npm audit reports zero vulnerabilities.

## Stacking fidelity fix · 2026-10-14

Applied the installed Implement/TDD/Code Review skills, with the user's approved existing simulation seams and recommended defaults. The user request overrides the skill's commit step; publication remains coordinated separately. Red-before-green slices: body blocking failed the old crossing implementation; falling support failed at ground height instead of a teammate's head; rider carry failed its known 110px displacement; overhead-wall safety failed when the base left the rider behind; occupied-spawn recovery failed with overlapping bodies. Each was implemented and rerun before the next slice. Ceiling, independent walk-off/jump, fast moving-head landing, first-garden normal commands and frame timing are additional regression coverage, not falsely claimed as all test-first.

Independent specification review found simultaneous-jump cancellation and a base suspended by rider floor contact. Both received failing public-seam tests for each player role, then fixes and passing rechecks. Final specification recheck passed both fixes for both roles, simultaneous jumps under four ceiling clearances, and repeated 80-seed/six-garden sampling after the resolution-order change without body or terrain overlap. Standards review found no hard violations; longer step logic and repeated contact tolerance were minor nonblocking observations. No blocking review issue remains.

Current full suite: **35/35 passing**; type checking and production build pass. All six unchanged gardens have complete legitimate solo routes with no falls; commands now hop over parked friends and wait to land before a subsequent jump. No state injection or teleportation is used in those routes. Tests cover both player roles, solid sides, head/feet collision, resting support, carry on walking and base jumping, rider jump/walk-off/coyote behavior, low ceilings, rider walls, fast falling, blocked planter safety, occupied spawn recovery, simultaneous stack jumps, rider-to-ledge support transfer with a falling base, restart, and identical stack movement at 30Hz/144Hz. Missing input stops base and rider immediately; existing InputBuffer/clock tests cover cleared queued/held input and capped tab interruptions. A deterministic seed-192613 exploratory run exercised 12,000 normal-input ticks in each of the six gardens without teammate-body overlap; this is robustness sampling, not a campaign playthrough.

Browser verification for this change is **pending the coordinating agent**. No fresh browser or server action was performed by the implementation agent; historical screenshots show the old pass-through version. Suggested fresh probe: select local co-op in Garden 1, briefly hold W+D (about one sixth of a second), release, observe Sol land on Luna, then hold → and observe both move while stacked. Press W to observe Sol separate upward, then release and check landing. Repeat in solo by using Tab to select the base before carrying. Observe bodies stop side-to-side; observe actual responses after inputs. Preserve existing progress and use an isolated browser session if available.

The layouts, key/beacon/portal rules, assets, story and version-1 save schema are unchanged. Side contact blocks rather than forcing a teammate sideways; broader synchronized gimmicks and mandatory-stack puzzle redesign are outside this focused fix. Physical two-person keyboard rollover, physical touch multitouch and a fresh full browser campaign remain unverified.

## Fresh focused browser verification · 2026-10-14

Coordinated Chrome extension check at http://localhost:5178/ used ordinary controls on Garden 1 with the served production JS index-BZKS2Hf5.js and CSS index-op65skeS.css, both verified against the build bytes. In local co-op, W+D held about167ms moved Sol above Luna; after release Sol visibly settled with feet on Luna’s head. Right held250ms moved both bodies about38 rendered pixels while their stack remained intact. W held50ms then visibly lifted Sol away while Luna stayed on the ground. After reload (no progress clearing), solo mode repeated the stack; Tab selected Luna, and Right250ms again carried the supported Sol. Pause/resume preserved the stacked positions. No hidden state or debug inputs were used. This is focused desktop stack/ride/jump evidence; the six-garden routes and collision/recovery edge cases are simulation coverage, not newly repeated browser campaigns.
