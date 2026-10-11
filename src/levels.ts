export type Rect = { x: number; y: number; w: number; h: number };
export type Beacon = { x: number; y: number; role: 0 | 1 };
export type Level = {
  name: string;
  hint: string;
  platforms: Rect[];
  beacons: Beacon[];
  gates: (Rect & { links: number[] })[];
  key: { x: number; y: number };
  portal: Rect;
  spawns: [number, number][];
};
const ground = { x: 0, y: 470, w: 960, h: 70 };
const shelf = (x: number, y: number, w: number): Rect => ({ x, y, w, h: 18 });
const portal = { x: 852, y: 394, w: 80, h: 76 };
export const levels: Level[] = [
  {
    name: "A spark between us",
    hint: "Find the key, then meet at the arch. Jump with W / ↑.",
    platforms: [ground, shelf(350, 410, 130)],
    beacons: [],
    gates: [],
    key: { x: 415, y: 386 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
  {
    name: "Sun & moon",
    hint: "Sol lights ☀ with E. Luna lights ☾ with Enter. Lights stay on.",
    platforms: [ground, shelf(220, 400, 120), shelf(420, 400, 120)],
    beacons: [
      { x: 275, y: 400, role: 0 },
      { x: 475, y: 400, role: 1 },
    ],
    gates: [{ x: 650, y: 320, w: 20, h: 150, links: [0, 1] }],
    key: { x: 745, y: 446 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
  {
    name: "The winding orchard",
    hint: "Climb the orchard. Each light opens a different gate.",
    platforms: [
      ground,
      shelf(180, 410, 110),
      shelf(310, 350, 110),
      shelf(445, 290, 110),
      shelf(650, 410, 110),
    ],
    beacons: [
      { x: 365, y: 350, role: 1 },
      { x: 500, y: 290, role: 0 },
    ],
    gates: [
      { x: 590, y: 240, w: 18, h: 230, links: [0] },
      { x: 800, y: 310, w: 18, h: 160, links: [1] },
    ],
    key: { x: 705, y: 386 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
  {
    name: "Across the quiet water",
    hint: "Hop over the water. Falling returns you safely; your light stays lit.",
    platforms: [
      shelf(0, 470, 280),
      shelf(350, 440, 100),
      shelf(520, 410, 110),
      shelf(700, 470, 260),
    ],
    beacons: [
      { x: 400, y: 440, role: 0 },
      { x: 575, y: 410, role: 1 },
    ],
    gates: [{ x: 790, y: 320, w: 18, h: 150, links: [0, 1] }],
    key: { x: 735, y: 446 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
  {
    name: "A little backtracking",
    hint: "Luna opens the way for Sol. Bring both lights home.",
    platforms: [
      ground,
      shelf(150, 405, 120),
      shelf(315, 340, 120),
      shelf(495, 405, 120),
      shelf(670, 340, 120),
    ],
    beacons: [
      { x: 210, y: 405, role: 1 },
      { x: 730, y: 340, role: 0 },
    ],
    gates: [
      { x: 465, y: 260, w: 18, h: 210, links: [0] },
      { x: 820, y: 260, w: 18, h: 210, links: [1] },
    ],
    key: { x: 550, y: 381 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
  {
    name: "The garden wakes",
    hint: "Four lights, two friends, one last sunrise. Restore every beacon.",
    platforms: [
      ground,
      shelf(160, 405, 110),
      shelf(295, 340, 110),
      shelf(445, 275, 110),
      shelf(620, 340, 110),
    ],
    beacons: [
      { x: 215, y: 405, role: 0 },
      { x: 350, y: 340, role: 1 },
      { x: 500, y: 275, role: 0 },
      { x: 675, y: 340, role: 1 },
    ],
    gates: [{ x: 780, y: 200, w: 20, h: 270, links: [0, 1, 2, 3] }],
    key: { x: 830, y: 446 },
    portal,
    spawns: [
      [70, 438],
      [120, 438],
    ],
  },
];
