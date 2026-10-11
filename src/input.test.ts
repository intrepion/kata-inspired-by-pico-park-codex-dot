import { test } from "node:test";
import assert from "node:assert/strict";
import { InputBuffer } from "./input.js";
test("a tap between ticks is observed once; clearing a menu transition removes held and queued input", () => {
  const b = new InputBuffer();
  b.down("e");
  b.up("e");
  assert.equal(b.has("e"), true);
  b.tick();
  assert.equal(b.has("e"), false);
  b.down("d");
  b.tick();
  assert.equal(b.has("d"), true);
  b.clear();
  assert.equal(b.has("d"), false);
});
