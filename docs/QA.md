# Verification evidence

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

No online networking. No stacking. No physical two-person keyboard-rollover or physical mobile multitouch session. Small portrait screen makes the playfield compact; landscape recommended. Sound is synthesized feedback only; speaker output not listened to. Session server requires restart after logout/reboot and is loopback-only. Sidebar project registration is unavailable through the supported tools in this environment.
