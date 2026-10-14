import { levels, type Rect, type Level, type Planter } from "./levels.js";
export const DT = 1 / 120;
export type Input = {
  left?: boolean;
  right?: boolean;
  jump?: boolean;
  act?: boolean;
};
export type Player = Rect & {
  vx: number;
  vy: number;
  grounded: boolean;
  coyote: number;
  buffer: number;
  lastJump: boolean;
  lastAct: boolean;
};
export type World = {
  level: Level;
  index: number;
  players: Player[];
  lit: boolean[];
  planters: Planter[];
  key: boolean;
  won: boolean;
  ticks: number;
  falls: number;
};
export function createWorld(index: number, level?: Level): World {
  index =
    Number.isInteger(index) && index >= 0 && index < levels.length ? index : 0;
  level ??= levels[index];
  return {
    index,
    level,
    players: level.spawns.map(([x, y]) => ({
      x,
      y,
      w: 26,
      h: 32,
      vx: 0,
      vy: 0,
      grounded: false,
      coyote: 0,
      buffer: 0,
      lastJump: false,
      lastAct: false,
    })),
    planters: (level.planters ?? []).map((planter) => ({ ...planter })),
    lit: level.beacons.map(() => false),
    key: false,
    won: false,
    ticks: 0,
    falls: 0,
  };
}
export function overlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
function limitTravel(
  body: Rect,
  amount: number,
  solids: Rect[],
  axis: "x" | "y",
) {
  const cross = axis === "x" ? "y" : "x";
  const size = axis === "x" ? "w" : "h";
  const crossSize = axis === "x" ? "h" : "w";
  for (const solid of solids) {
    if (
      body[cross] >= solid[cross] + solid[crossSize] ||
      body[cross] + body[crossSize] <= solid[cross]
    )
      continue;
    if (amount > 0 && body[axis] + body[size] <= solid[axis] + 0.001)
      amount = Math.min(
        amount,
        Math.max(0, solid[axis] - body[axis] - body[size]),
      );
    if (amount < 0 && body[axis] >= solid[axis] + solid[size] - 0.001)
      amount = Math.max(
        amount,
        Math.min(0, solid[axis] + solid[size] - body[axis]),
      );
  }
  return amount;
}
export function step(w: World, inputs: Input[]) {
  if (w.won) return;
  w.ticks++;
  const solids = [
    ...w.level.platforms,
    ...w.planters,
    ...w.level.gates.filter((g) => !g.links.every((i) => w.lit[i])),
  ];
  const before = w.players.map((p) => ({ x: p.x, y: p.y }));
  const supports = w.players.map((p, id) =>
    p.grounded
      ? w.players.findIndex(
          (other, otherId) =>
            otherId !== id &&
            p.x < other.x + other.w &&
            p.x + p.w > other.x &&
            Math.abs(p.y + p.h - other.y) < 0.001,
        )
      : -1,
  );
  w.players.forEach((p, id) => {
    const input = inputs[id] ?? {};
    p.buffer = input.jump && !p.lastJump ? 0.12 : Math.max(0, p.buffer - DT);
    p.lastJump = !!input.jump;
    p.coyote = p.grounded ? 0.09 : Math.max(0, p.coyote - DT);
    p.vx = ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 220;
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -430;
      p.buffer = 0;
      p.coyote = 0;
      p.grounded = false;
      supports[id] = -1;
    }
  });
  // Bases lead carried stacks; independently rising friends move top first so
  // simultaneous jumps see the teammate's actual position, not stale feet.
  const order = w.players
    .map((_, id) => id)
    .sort((a, b) => {
      if (supports[a] === b) return 1;
      if (supports[b] === a) return -1;
      return w.players[a].vy < 0 && w.players[b].vy < 0
        ? before[a].y - before[b].y
        : before[b].y - before[a].y;
    });
  for (const id of order) {
    const p = w.players[id];
    const input = inputs[id] ?? {};
    const support = supports[id] < 0 ? undefined : w.players[supports[id]];
    const oldX = p.x;
    let dx = p.vx * DT + (support ? support.x - before[supports[id]].x : 0);
    const riders = w.players.filter((_, otherId) => supports[otherId] === id);
    for (const rider of riders) dx = limitTravel(rider, dx, solids, "x");
    p.x += dx;
    for (const planter of w.planters) {
      if (p.vx !== 0 && overlap(p, planter)) {
        const nextX = Math.max(
          planter.minX,
          Math.min(planter.maxX, planter.x + p.vx * DT),
        );
        const moved = { ...planter, x: nextX };
        if (
          !w.players.some(
            (other, otherId) => otherId !== id && overlap(other, moved),
          )
        )
          planter.x = nextX;
      }
    }
    p.x =
      oldX +
      limitTravel(
        { ...p, x: oldX },
        dx,
        [...solids, ...w.players.filter((_, otherId) => otherId !== id)],
        "x",
      );
    p.x = Math.max(8, Math.min(926, p.x));
    const riding =
      support && p.x < support.x + support.w && p.x + p.w > support.x;
    p.vy = riding ? 0 : Math.min(650, p.vy + 1200 * DT);
    const wantedY = riding ? support.y - before[supports[id]].y : p.vy * DT;
    let dy = limitTravel(
      p,
      wantedY,
      [
        ...solids,
        ...w.players.filter(
          (_, otherId) => otherId !== id && supports[otherId] !== id,
        ),
      ],
      "y",
    );
    // A ceiling stops a rising stack; a ledge may catch a descending rider
    // while letting the base fall away below them.
    if (dy < 0)
      for (const rider of riders)
        dy = limitTravel(
          { ...rider, x: rider.x + p.x - oldX },
          dy,
          solids,
          "y",
        );
    p.y += dy;
    p.grounded = !!riding || (wantedY > 0 && dy < wantedY);
    if (dy !== wantedY) p.vy = 0;
    if (p.y > 550) {
      const [x, y] = w.level.spawns[id];
      p.x = x;
      p.y = y;
      // A friend may be parked at the spawn. Use the nearest free side position.
      for (let offset = 0; offset <= 960; offset += p.w) {
        const freeX = [x - offset, x + offset].find(
          (candidate) =>
            candidate >= 8 &&
            candidate <= 926 &&
            ![
              ...solids,
              ...w.players.filter((_, otherId) => otherId !== id),
            ].some((solid) => overlap({ ...p, x: candidate }, solid)),
        );
        if (freeX !== undefined) {
          p.x = freeX;
          break;
        }
      }
      p.vy = 0;
      p.vx = 0;
      p.buffer = 0;
      p.coyote = 0;
      p.grounded = false;
      supports.forEach((base, rider) => {
        if (base === id) supports[rider] = -1;
      });
      w.falls++;
    }
    if (input.act && !p.lastAct)
      w.level.beacons.forEach((b, i) => {
        if (
          b.role === id &&
          Math.abs(p.x + 13 - b.x) < 42 &&
          Math.abs(p.y + 32 - b.y) < 50
        )
          w.lit[i] = true;
      });
    p.lastAct = !!input.act;
    if (
      overlap(p, { x: w.level.key.x - 12, y: w.level.key.y - 15, w: 24, h: 30 })
    )
      w.key = true;
  }
  w.won =
    w.key &&
    w.lit.every(Boolean) &&
    w.players.every((p) => overlap(p, w.level.portal));
}
export function decodeProgress(value: string | null): number {
  try {
    const data = JSON.parse(value ?? "null");
    return data?.version === 1 &&
      Number.isInteger(data.unlocked) &&
      data.unlocked >= 1 &&
      data.unlocked <= levels.length
      ? data.unlocked
      : 1;
  } catch {
    return 1;
  }
}
