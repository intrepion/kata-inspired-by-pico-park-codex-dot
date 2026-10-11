import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorld, step, type World, type Input } from "./world";
function tick(w: World, id: number, input: Input = {}, count = 1) {
  for (let i = 0; i < count; i++) step(w, id === 0 ? [input, {}] : [{}, input]);
}
function move(w: World, id: number, x: number) {
  for (let n = 0; !w.won && Math.abs(w.players[id].x - x) > 2; n++) {
    assert.ok(n < 800, `route blocked at ${w.players[id].x}, aiming ${x}`);
    tick(w, id, { right: w.players[id].x < x, left: w.players[id].x > x });
  }
}
function jump(w: World, id: number, x: number) {
  tick(w, id, {
    jump: true,
    right: w.players[id].x < x,
    left: w.players[id].x > x,
  });
  move(w, id, x);
  tick(w, id, {}, 100);
}
function light(w: World, id: number) {
  tick(w, id, { act: true });
  tick(w, id);
}
function exit(w: World, id: number) {
  move(w, id, 860);
  tick(w, id, {}, 100);
}
const first = (w: World, id: number) => {
  move(w, id, 70);
  jump(w, id, 205);
};
for (let index = 0; index < 6; index++)
  test(`garden ${index + 1} has a legitimate complete solo route with both creatures`, () => {
    const w = createWorld(index);
    tick(w, 0, {}, 20);
    if (index === 0) {
      for (const id of [0, 1]) {
        move(w, id, 250);
        jump(w, id, 415);
        exit(w, id);
      }
    }
    if (index === 1) {
      for (const id of [0, 1]) {
        move(w, id, 130);
        jump(w, id, 260);
        if (id === 0) light(w, id);
        move(w, id, 325);
        jump(w, id, 470);
        if (id === 1) light(w, id);
      }
      exit(w, 0);
      exit(w, 1);
    }
    if (index === 2) {
      for (const id of [0, 1]) {
        first(w, id);
        jump(w, id, 345);
        if (id === 1) light(w, id);
        jump(w, id, 485);
        if (id === 0) light(w, id);
      }
      exit(w, 0);
      exit(w, 1);
    }
    if (index === 3) {
      for (const id of [0, 1]) {
        move(w, id, 250);
        jump(w, id, 395);
        if (id === 0) light(w, id);
        jump(w, id, 555);
        if (id === 1) light(w, id);
        jump(w, id, 735);
      }
      exit(w, 0);
      exit(w, 1);
    }
    if (index === 4) {
      first(w, 1);
      light(w, 1);
      first(w, 0);
      jump(w, 0, 350);
      jump(w, 0, 510);
      move(w, 0, 585);
      jump(w, 0, 725);
      light(w, 0);
      exit(w, 0);
      jump(w, 1, 350);
      jump(w, 1, 510);
      exit(w, 1);
    }
    if (index === 5) {
      first(w, 0);
      light(w, 0);
      jump(w, 0, 340);
      jump(w, 0, 490);
      light(w, 0);
      first(w, 1);
      jump(w, 1, 340);
      light(w, 1);
      jump(w, 1, 490);
      move(w, 1, 670);
      tick(w, 1, {}, 100);
      light(w, 1);
      exit(w, 1);
      exit(w, 0);
    }
    assert.equal(w.won, true);
    assert.equal(w.key, true);
    assert.ok(w.lit.every(Boolean));
    assert.equal(w.falls, 0);
  });
