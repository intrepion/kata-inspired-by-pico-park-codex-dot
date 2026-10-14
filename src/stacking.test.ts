import { test } from "node:test";
import assert from "node:assert/strict";
import type { Level } from "./levels";
import { TickClock } from "./clock";
import { createWorld, step, overlap, type World, type Input } from "./world";

const garden = (extra: Partial<Level> = {}): Level => ({
  name: "stacking fixture",
  hint: "",
  platforms: [{ x: 0, y: 470, w: 960, h: 70 }],
  beacons: [],
  gates: [],
  key: { x: 800, y: 300 },
  portal: { x: 850, y: 394, w: 80, h: 76 },
  spawns: [
    [200, 300],
    [200, 438],
  ],
  ...extra,
});

test("a walking base carries its rider while the rider can jump away", () => {
  const w = createWorld(0, garden());
  ticks(w, [{}, {}], 120);
  ticks(w, [{}, { right: true }], 60);
  assert.ok(Math.abs(w.players[0].x - 310) < 0.001);
  assert.ok(Math.abs(w.players[1].x - 310) < 0.001);
  assert.equal(w.players[0].y, 406);
  step(w, [{ jump: true }, { right: true }]);
  assert.ok(w.players[0].vy < 0);
  assert.ok(w.players[0].y < 406);
  assert.equal(w.players[0].grounded, false);
  assert.ok(w.players[1].x > w.players[0].x);
});
function ticks(w: World, inputs: Input[], count: number) {
  for (let i = 0; i < count; i++) step(w, inputs);
}

test("a falling friend lands on the other's head and remains supported", () => {
  const w = createWorld(0, garden());
  ticks(w, [{}, {}], 240);
  assert.equal(w.players[0].y, 406);
  assert.equal(w.players[1].y, 438);
  assert.equal(w.players[0].grounded, true);
  assert.equal(overlap(w.players[0], w.players[1]), false);
});

test("a rider blocked by an overhead wall stops the base before either friend is crushed", () => {
  const w = createWorld(
    0,
    garden({
      platforms: [
        { x: 0, y: 470, w: 960, h: 70 },
        { x: 300, y: 380, w: 100, h: 50 },
      ],
    }),
  );
  ticks(w, [{}, {}], 120);
  ticks(w, [{}, { right: true }], 120);
  assert.equal(w.players[0].x, 274);
  assert.equal(w.players[1].x, 274);
  assert.equal(w.players[0].y, 406);
  assert.equal(overlap(w.players[0], w.players[1]), false);
  assert.equal(overlap(w.players[0], w.level.platforms[1]), false);
});

test("a jumping base lifts the rider until a low ceiling stops the whole stack", () => {
  const w = createWorld(
    0,
    garden({
      platforms: [
        { x: 0, y: 470, w: 960, h: 70 },
        { x: 180, y: 350, w: 100, h: 20 },
      ],
      spawns: [
        [200, 406],
        [200, 438],
      ],
    }),
  );
  ticks(w, [{}, {}], 2);
  step(w, [{}, { jump: true }]);
  assert.ok(w.players[0].y < 406);
  assert.equal(w.players[0].y + 32, w.players[1].y);
  ticks(w, [{}, { jump: true }], 20);
  assert.ok(w.players[0].y >= 370);
  assert.equal(overlap(w.players[0], w.players[1]), false);
  assert.equal(overlap(w.players[0], w.level.platforms[1]), false);
  ticks(w, [{}, { jump: true }], 180);
  assert.equal(w.players[0].y, 406);
  assert.equal(w.players[1].y, 438);
});

test("a rider may walk off either friend, fall, and use normal jump buffering", () => {
  for (const rider of [0, 1]) {
    const w = createWorld(
      0,
      garden({
        spawns:
          rider === 0
            ? [
                [200, 406],
                [200, 438],
              ]
            : [
                [200, 438],
                [200, 406],
              ],
      }),
    );
    ticks(w, [{}, {}], 2);
    ticks(w, rider === 0 ? [{ right: true }, {}] : [{}, { right: true }], 20);
    assert.equal(w.players[rider].grounded, false);
    assert.ok(w.players[rider].y > 406);
    step(w, rider === 0 ? [{ jump: true }, {}] : [{}, { jump: true }]);
    assert.ok(w.players[rider].vy < 0);
    ticks(w, [{}, {}], 180);
    assert.equal(w.players[rider].y, 438);
  }
});

test("jumping into a friend's feet stops the ascent without passing through", () => {
  const w = createWorld(
    0,
    garden({
      platforms: [
        { x: 0, y: 470, w: 960, h: 70 },
        { x: 100, y: 370, w: 115, h: 10 },
      ],
      spawns: [
        [210, 338],
        [226, 438],
      ],
    }),
  );
  ticks(w, [{}, {}], 2);
  step(w, [{}, { jump: true }]);
  for (let i = 0; i < 40; i++) {
    step(w, [{}, { jump: true }]);
    assert.equal(overlap(w.players[0], w.players[1]), false);
    assert.ok(w.players[1].y >= 370);
  }
});

test("a moving friend's head catches a fast falling rider without tunneling", () => {
  const w = createWorld(
    0,
    garden({
      spawns: [
        [300, 100],
        [140, 438],
      ],
    }),
  );
  for (let i = 0; i < 110; i++) {
    step(w, [{}, { right: true }]);
    assert.equal(overlap(w.players[0], w.players[1]), false);
  }
  assert.ok(w.players[0].grounded);
  assert.equal(w.players[0].y + 32, w.players[1].y);
});

test("the first garden supports visible normal-control stacking and a fresh restart separates friends", () => {
  const w = createWorld(0);
  ticks(w, [{}, {}], 20);
  ticks(w, [{ jump: true, right: true }, {}], 20);
  ticks(w, [{}, {}], 100);
  assert.equal(w.players[0].y, 406);
  assert.equal(w.players[0].grounded, true);
  ticks(w, [{}, { right: true }], 30);
  assert.ok(w.players[0].x > 150);
  assert.equal(w.players[0].y + 32, w.players[1].y);
  const reset = createWorld(0);
  assert.equal(reset.players[0].x, 70);
  assert.equal(reset.players[1].x, 120);
});

test("fall recovery chooses a free place when a friend occupies the original spawn", () => {
  const w = createWorld(
    0,
    garden({
      platforms: [{ x: 0, y: 470, w: 220, h: 70 }],
      spawns: [
        [100, 438],
        [150, 438],
      ],
    }),
  );
  ticks(w, [{}, {}], 20);
  ticks(w, [{ right: true }, { right: true }], 30);
  for (let i = 0; i < 100 && w.falls === 0; i++) step(w, [{}, { right: true }]);
  assert.equal(w.falls, 1);
  assert.equal(overlap(w.players[0], w.players[1]), false);
  assert.equal(w.players[1].y, 438);
});

test("30Hz and 144Hz frames carry a stack equally and clearing input stops it immediately", () => {
  const results = [30, 144].map((hz) => {
    const w = createWorld(
      0,
      garden({
        spawns: [
          [200, 406],
          [200, 438],
        ],
      }),
    );
    ticks(w, [{}, {}], 2);
    const clock = new TickClock();
    for (let i = 0; i < hz; i++)
      for (let n = clock.advance(1 / hz); n > 0; n--)
        step(w, [{}, { right: true }]);
    assert.ok(Math.abs(w.players[0].x - 420) < 0.001);
    assert.equal(w.players[0].y, 406);
    const parkedX = w.players[0].x;
    ticks(w, [], 60);
    assert.equal(w.players[0].x, parkedX);
    assert.equal(w.players[1].x, parkedX);
    return w.players.map((p) => [p.x, p.y]);
  });
  assert.deepEqual(results[0], results[1]);
});

test("both friends may jump simultaneously from a stack without losing either jump", () => {
  for (const rider of [0, 1]) {
    const w = createWorld(
      0,
      garden({
        spawns:
          rider === 0
            ? [
                [200, 406],
                [200, 438],
              ]
            : [
                [200, 438],
                [200, 406],
              ],
      }),
    );
    ticks(w, [{}, {}], 2);
    step(w, [{ jump: true }, { jump: true }]);
    assert.ok(w.players.every((p) => p.vy < 0 && !p.grounded));
    assert.equal(w.players[rider].y + 32, w.players[1 - rider].y);
    for (let i = 0; i < 120; i++) {
      step(w, [{ jump: true }, { jump: true }]);
      assert.equal(overlap(w.players[0], w.players[1]), false);
    }
  }
});

test("a rider catching a ledge transfers to terrain while the base keeps falling", () => {
  for (const rider of [0, 1]) {
    const w = createWorld(
      0,
      garden({
        platforms: [{ x: 0, y: 470, w: 280, h: 70 }],
        spawns:
          rider === 0
            ? [
                [250, 406],
                [275, 438],
              ]
            : [
                [275, 438],
                [250, 406],
              ],
      }),
    );
    ticks(w, [{}, {}], 2);
    ticks(w, rider === 0 ? [{}, { right: true }] : [{ right: true }, {}], 3);
    ticks(w, [{}, {}], 120);
    assert.ok(
      w.falls > 0,
      "a base outside the ledge must fall instead of hanging from a rider",
    );
    assert.equal(w.players[rider].y, 438);
    assert.equal(w.players[rider].grounded, true);
    assert.equal(overlap(w.players[0], w.players[1]), false);
  }
});
