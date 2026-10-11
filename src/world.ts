import { levels, type Rect, type Level } from "./levels.js";
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
export function step(w: World, inputs: Input[]) {
  if (w.won) return;
  w.ticks++;
  const solids = [
    ...w.level.platforms,
    ...w.level.gates.filter((g) => !g.links.every((i) => w.lit[i])),
  ];
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
    }
    p.x += p.vx * DT;
    for (const s of solids)
      if (overlap(p, s)) p.x = p.vx > 0 ? s.x - p.w : s.x + s.w;
    p.x = Math.max(8, Math.min(926, p.x));
    p.vy = Math.min(650, p.vy + 1200 * DT);
    p.y += p.vy * DT;
    p.grounded = false;
    for (const s of solids)
      if (overlap(p, s)) {
        if (p.vy >= 0) {
          p.y = s.y - p.h;
          p.grounded = true;
        } else p.y = s.y + s.h;
        p.vy = 0;
      }
    if (p.y > 550) {
      const [x, y] = w.level.spawns[id];
      p.x = x;
      p.y = y;
      p.vy = 0;
      p.vx = 0;
      p.buffer = 0;
      p.coyote = 0;
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
  });
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
