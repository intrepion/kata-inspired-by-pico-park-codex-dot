import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorld, step } from "./world";
import type { Level } from "./levels";
const garden: Level = {
  name: "fixture",
  hint: "",
  platforms: [{ x: 0, y: 470, w: 960, h: 70 }],
  beacons: [],
  gates: [],
  key: { x: 800, y: 400 },
  portal: { x: 850, y: 394, w: 80, h: 76 },
  spawns: [
    [70, 438],
    [400, 438],
  ],
  planters: [{ x: 150, y: 436, w: 34, h: 34, minX: 100, maxX: 250 }],
};
test("a creature pushes a planter along its rail and cannot push it through the end stop", () => {
  const w = createWorld(0, garden);
  for (let i = 0; i < 180; i++) step(w, [{ right: true }, {}]);
  assert.equal(w.planters[0].x, 250);
  assert.equal(w.players[0].x, 224);
  const reset = createWorld(0, garden);
  assert.equal(reset.planters[0].x, 150);
});
test("a planter blocks rather than crushing the other friend", () => {
  const l = {
    ...garden,
    spawns: [
      [70, 438],
      [220, 438],
    ] as [number, number][],
  };
  const w = createWorld(0, l);
  for (let i = 0; i < 120; i++) step(w, [{ right: true }, {}]);
  assert.ok(w.planters[0].x + w.planters[0].w <= w.players[1].x);
  assert.equal(w.players[1].x, 220);
});
