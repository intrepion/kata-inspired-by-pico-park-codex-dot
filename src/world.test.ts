import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorld, step } from "./world.js";
test("creatures land on solid ground and simultaneous movement is independent", () => {
  const w = createWorld(0);
  for (let i = 0; i < 120; i++) step(w, [{ left: true }, { right: true }]);
  assert.equal(w.players[0].y, 438);
  assert.equal(w.players[1].y, 438);
  assert.equal(w.players[0].x, 8);
  assert.ok(w.players[1].x > 330);
});
test("a beacon responds only to its creature and remains lit after leaving", () => {
  const level = {
    name: "fixture",
    hint: "",
    platforms: [{ x: 0, y: 470, w: 960, h: 70 }],
    beacons: [{ x: 83, y: 470, role: 1 as const }],
    gates: [],
    key: { x: 800, y: 400 },
    portal: { x: 850, y: 400, w: 80, h: 70 },
    spawns: [
      [100, 438],
      [70, 438],
    ] as [number, number][],
  };
  const w = createWorld(0, level);
  step(w, [{ act: true }, {}]);
  assert.equal(w.lit[0], false);
  step(w, [{}, { act: true }]);
  assert.equal(w.lit[0], true);
  for (let i = 0; i < 100; i++) step(w, [{}, { right: true }]);
  assert.equal(w.lit[0], true);
});
test("releasing a jump then buffering before landing produces a new jump", () => {
  const w = createWorld(0);
  for (let i = 0; i < 20; i++) step(w, [{}, {}]);
  step(w, [{ jump: true }, {}]);
  assert.ok(w.players[0].vy < 0);
  for (let i = 0; i < 78; i++) step(w, [{}, {}]);
  step(w, [{ jump: true }, {}]);
  for (let i = 0; i < 9; i++) step(w, [{ jump: true }, {}]);
  assert.ok(w.players[0].vy < 0);
});
test("invalid stage indices safely load the first garden", () => {
  assert.equal(createWorld(999).index, 0);
});
import { decodeProgress } from "./world.js";
import { levels, type Level } from "./levels.js";
const fixture = (extra: Partial<Level> = {}): Level => ({
  name: "fixture",
  hint: "",
  platforms: [{ x: 0, y: 470, w: 960, h: 70 }],
  beacons: [],
  gates: [],
  key: { x: 83, y: 446 },
  portal: { x: 850, y: 394, w: 80, h: 76 },
  spawns: [
    [70, 438],
    [120, 438],
  ],
  ...extra,
});
test("a portal waits for both friends, all lights, and the shared key; completion is idempotent", () => {
  const w = createWorld(
    0,
    fixture({
      spawns: [
        [860, 438],
        [70, 438],
      ],
      key: { x: 873, y: 446 },
    }),
  );
  step(w, [{}, {}]);
  assert.equal(w.key, true);
  assert.equal(w.won, false);
  for (let i = 0; i < 420; i++) step(w, [{}, { right: true }]);
  assert.equal(w.won, true);
  const ticks = w.ticks;
  for (let i = 0; i < 20; i++) step(w, [{ left: true }, { left: true }]);
  assert.equal(w.ticks, ticks);
});
test("a closed gate stops movement until its linked light is lit", () => {
  const w = createWorld(
    0,
    fixture({
      beacons: [{ x: 83, y: 470, role: 0 }],
      gates: [{ x: 200, y: 300, w: 20, h: 170, links: [0] }],
      spawns: [
        [70, 438],
        [750, 438],
      ],
    }),
  );
  for (let i = 0; i < 120; i++) step(w, [{ right: true }, {}]);
  assert.equal(w.players[0].x, 174);
  for (let i = 0; i < 50; i++) step(w, [{ left: true }, {}]);
  step(w, [{ act: true }, {}]);
  for (let i = 0; i < 120; i++) step(w, [{ right: true }, {}]);
  assert.ok(w.players[0].x > 200);
});
test("fall recovery retains collected key and lights; a fresh restart clears everything", () => {
  const l = fixture({ platforms: [], beacons: [{ x: 83, y: 470, role: 0 }] });
  const w = createWorld(0, l);
  step(w, [{ act: true }, {}]);
  for (let i = 0; i < 100; i++) step(w, [{}, {}]);
  assert.ok(w.falls > 0);
  assert.equal(w.key, true);
  assert.equal(w.lit[0], true);
  const reset = createWorld(0, l);
  assert.equal(reset.key, false);
  assert.deepEqual(reset.lit, [false]);
  assert.equal(reset.ticks, 0);
  assert.equal(reset.falls, 0);
  assert.equal(reset.won, false);
  assert.equal(reset.players[0].x, 70);
});
test("save validation rejects corrupt, wrong-version, out-of-range and fractional progress", () => {
  for (const s of [
    null,
    "bad",
    "null",
    "{}",
    '{"version":2,"unlocked":6}',
    '{"version":1,"unlocked":99}',
    '{"version":1,"unlocked":2.5}',
  ])
    assert.equal(decodeProgress(s), 1);
  assert.equal(decodeProgress('{"version":1,"unlocked":6}'), 6);
});
test("holding jump cannot create repeated automatic jumps", () => {
  const w = createWorld(0);
  for (let i = 0; i < 20; i++) step(w, [{}, {}]);
  for (let i = 0; i < 180; i++) step(w, [{ jump: true }, {}]);
  assert.equal(w.players[0].y, 438);
});
test("friends approaching each other stop at body contact without crossing or crushing", () => {
  const w = createWorld(
    0,
    fixture({
      spawns: [
        [70, 438],
        [170, 438],
      ],
    }),
  );
  for (let i = 0; i < 60; i++) step(w, [{ right: true }, { left: true }]);
  assert.ok(w.players[0].x + 26 <= w.players[1].x);
  assert.ok(w.players[0].x > 70);
  assert.ok(w.players[1].x < 170);
  assert.equal(w.players[0].y, 438);
  assert.equal(w.players[1].y, 438);
});
test("the exit remains closed to completion when a key or required light is missing", () => {
  const l = fixture({
    spawns: [
      [860, 438],
      [890, 438],
    ],
    key: { x: 100, y: 446 },
    beacons: [{ x: 873, y: 470, role: 0 }],
  });
  const w = createWorld(0, l);
  step(w, [{ act: true }, {}]);
  assert.equal(w.won, false);
  const missingLight = createWorld(0, { ...l, key: { x: 873, y: 446 } });
  step(missingLight, [{}, {}]);
  assert.equal(missingLight.key, true);
  assert.equal(missingLight.won, false);
  step(missingLight, [{ act: true }, {}]);
  assert.equal(missingLight.won, true);
});
test("coyote time allows a jump just after walking off a ledge", () => {
  const w = createWorld(
    0,
    fixture({
      platforms: [{ x: 0, y: 470, w: 110, h: 20 }],
      spawns: [
        [90, 438],
        [10, 438],
      ],
    }),
  );
  step(w, [{}, {}]);
  for (let i = 0; i < 12; i++) step(w, [{ right: true }, {}]);
  assert.equal(w.players[0].grounded, false);
  step(w, [{ jump: true }, {}]);
  assert.ok(w.players[0].vy < 0);
});
