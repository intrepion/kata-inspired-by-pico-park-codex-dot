import { test } from "node:test";
import assert from "node:assert/strict";
import { TickClock } from "./clock.js";
import { createWorld, step } from "./world.js";
test("30Hz and 144Hz frames produce the same one-second movement", () => {
  const results = [30, 144].map((hz) => {
    const c = new TickClock(),
      w = createWorld(0);
    let ticks = 0;
    for (let i = 0; i < hz; i++)
      for (let n = c.advance(1 / hz); n > 0; n--) {
        step(w, [{ right: true }, { right: true }]);
        ticks++;
      }
    assert.equal(ticks, 120);
    return w.players[0].x;
  });
  assert.ok(Math.abs(results[0] - 290) < 0.001);
  assert.equal(results[0], results[1]);
});
test("a long interruption is capped and clearing discards leftover time", () => {
  const c = new TickClock();
  assert.equal(c.advance(5), 12);
  c.advance(0.004);
  c.clear();
  assert.equal(c.advance(0.004), 0);
});
