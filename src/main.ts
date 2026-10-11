import "./style.css";
import { TickClock } from "./clock";
import { InputBuffer } from "./input";
import { levels } from "./levels";
import { createWorld, step, DT, decodeProgress, type Input } from "./world";
const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML = `<header><div><div class="brand">Together, <span>Little Lights</span> ✦</div><p class="eyebrow">A small garden. A shared adventure.</p></div><nav aria-label="Game options"><button id="pause">Pause</button><button id="restart">Restart</button><button id="select">Gardens</button><button id="mute" aria-pressed="false">Sound off</button><button id="motion" aria-pressed="false">Motion on</button></nav></header><main><div class="stagebar"><div><p class="eyebrow" id="count"></p><h1 id="name"></h1><p class="hint" id="hint"></p></div><div class="badge" id="status" aria-live="polite">Find the key</div></div><div class="scene"><canvas width="960" height="540" aria-label="Cooperative platforming garden. Sol is golden; Luna is violet."></canvas><div class="overlay" id="overlay"><div class="card" id="card"></div></div></div><div class="touch" aria-label="Touch solo controls"><div class="touch-group"><button data-key="a" aria-label="Move left">◀</button><button data-key="d" aria-label="Move right">▶</button></div><div class="touch-group"><button id="swap">Swap</button><button data-key="e">Light</button><button data-key="w">Jump</button></div></div><div class="controls"><div class="player-info"><i class="dot"></i><strong>Sol</strong><span><kbd>A</kbd> <kbd>D</kbd> move · <kbd>W</kbd> jump · <kbd>E</kbd> light</span></div><div class="player-info"><i class="dot moon"></i><strong>Luna</strong><span><kbd>←</kbd> <kbd>→</kbd> move · <kbd>↑</kbd> jump · <kbd>Enter</kbd> light</span></div></div><footer><span id="mode-label">Local co-op · Two people, one keyboard</span><span>Esc pause · R restart · Tab swap in solo</span></footer></main>`;
const el = (id: string) => document.getElementById(id)!;
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
let world = createWorld(0),
  playing = false,
  solo = false,
  active = 0,
  unlocked = 1,
  muted = true,
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
try {
  unlocked = decodeProgress(localStorage.getItem("little-lights-progress"));
} catch {}
const keys = new InputBuffer();
const clock = new TickClock();
let audio: AudioContext | undefined;
function tone(freq: number) {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.04, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.23);
  } catch {}
}
function clear() {
  keys.clear();
  clock.clear();
}
function overlay(html: string) {
  playing = false;
  clear();
  el("overlay").hidden = false;
  el("card").innerHTML = html;
  el("card").querySelector("button")?.focus();
  el("pause").textContent = "Resume";
  el("pause").toggleAttribute("disabled", !html.includes('id="resume"'));
}
function resume() {
  clear();
  canvas.tabIndex = -1;
  canvas.focus();
  playing = true;
  el("pause").removeAttribute("disabled");
  el("overlay").hidden = true;
  el("pause").textContent = "Pause";
}
function load(i: number) {
  world = createWorld(i);
  active = 0;
  el("count").textContent = `Garden ${i + 1} / ${levels.length}`;
  el("name").textContent = world.level.name;
  el("hint").textContent = world.level.hint;
  resume();
}
function startMenu() {
  overlay(
    `<p class="eyebrow">Made for a little teamwork</p><h2>Good things grow<br>when we go together.</h2><p>Guide Sol and Luna through six floating gardens. Light your own beacons, find the shared key, and meet at the arch.</p><div class="actions"><button id="coop">Play local co-op</button><button id="solo" class="secondary">Play solo · swap friends</button></div><p>Solo: Tab switches friends. Both movement schemes control your selected friend. Lights remain lit while you switch.</p>`,
  );
  el("coop").onclick = () => {
    solo = false;
    el("mode-label").textContent = "Local co-op · Two people, one keyboard";
    load(0);
  };
  el("solo").onclick = () => {
    solo = true;
    el("mode-label").textContent =
      "Solo · Tab swaps friends · parked friend stays";
    load(0);
  };
}
function pause() {
  if (playing)
    overlay(
      `<p class="eyebrow">Take a breath</p><h2>The garden can wait.</h2><p>Your friends and lights are right where you left them.</p><div class="actions"><button id="resume">Keep going</button><button id="home" class="secondary">Change play mode</button></div>`,
    );
  else if (document.getElementById("resume")) resume();
  else return;
  if (!playing) {
    el("resume").onclick = resume;
    el("home").onclick = startMenu;
  }
}
el("pause").onclick = pause;
el("restart").onclick = () => load(world.index);
el("select").onclick = () => {
  overlay(
    `<p class="eyebrow">Your garden path</p><h2>Every light matters.</h2><div class="levels">${levels.map((l, i) => `<button data-level="${i}" ${i >= unlocked ? "disabled" : ""}>${i + 1}. ${l.name}${i >= unlocked ? " 🔒" : ""}</button>`).join("")}</div><div class="actions"><button id="back" class="secondary">Back</button></div>`,
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-level]")
    .forEach((b) => (b.onclick = () => load(Number(b.dataset.level))));
  el("back").onclick = resume;
};
el("mute").onclick = () => {
  muted = !muted;
  el("mute").textContent = muted ? "Sound off" : "Sound on";
  el("mute").setAttribute("aria-pressed", String(!muted));
  tone(520);
};
function motion() {
  el("motion").textContent = reduced ? "Motion reduced" : "Motion on";
  el("motion").setAttribute("aria-pressed", String(reduced));
}
el("motion").onclick = () => {
  reduced = !reduced;
  motion();
};
motion();
function swap() {
  if (playing && solo) {
    active = 1 - active;
    clear();
    tone(active ? 410 : 610);
  }
}
el("swap").onclick = swap;
const gameKeys = [
  "a",
  "d",
  "w",
  "e",
  "arrowleft",
  "arrowright",
  "arrowup",
  "enter",
];
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "escape") {
    e.preventDefault();
    if (!e.repeat) pause();
    return;
  }
  if (!playing) return;
  if (k === "r") {
    e.preventDefault();
    if (!e.repeat) load(world.index);
    return;
  }
  if (k === "tab" && solo) {
    e.preventDefault();
    if (!e.repeat) swap();
    return;
  }
  if (gameKeys.includes(k)) {
    e.preventDefault();
    keys.down(k);
  }
});
window.addEventListener("keyup", (e) => keys.up(e.key.toLowerCase()));
window.addEventListener("blur", () => {
  clear();
  if (playing) pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clear();
    if (playing) pause();
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (!playing) return;
    if (!solo) {
      solo = true;
      el("mode-label").textContent = "Touch solo · Swap changes friends";
    }
    b.setPointerCapture(e.pointerId);
    keys.down(b.dataset.key!);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => keys.up(b.dataset.key!));
});
function input(which: number): Input {
  if (solo && which !== active) return {};
  const first = which === 0 || solo;
  return {
    left:
      keys.has(first ? "a" : "arrowleft") || (solo && keys.has("arrowleft")),
    right:
      keys.has(first ? "d" : "arrowright") || (solo && keys.has("arrowright")),
    jump: keys.has(first ? "w" : "arrowup") || (solo && keys.has("arrowup")),
    act: keys.has(first ? "e" : "enter") || (solo && keys.has("enter")),
  };
}
function complete() {
  unlocked = Math.max(unlocked, Math.min(6, world.index + 2));
  try {
    localStorage.setItem(
      "little-lights-progress",
      JSON.stringify({ version: 1, unlocked }),
    );
  } catch {}
  tone(880);
  overlay(
    `<p class="eyebrow">Garden ${world.index + 1} restored</p><h2>${world.index === 5 ? "Look what we grew." : "A little brighter, together."}</h2><p>${world.index === 5 ? "Every beacon is awake. Sol and Luna have brought the garden home. Thanks for sharing the journey." : "Both friends made it. Your next garden is ready."}</p><div class="actions"><button id="next">${world.index === 5 ? "Play again" : "Next garden →"}</button><button id="again" class="secondary">Replay this garden</button></div>`,
  );
  el("next").onclick = () => load(world.index === 5 ? 0 : world.index + 1);
  el("again").onclick = () => load(world.index);
}
function round(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function text(t: string, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(t, x, y);
}
function draw(time: number) {
  const t = reduced ? 0 : time / 1000;
  const gradient = ctx.createLinearGradient(0, 0, 0, 540);
  gradient.addColorStop(0, "#a9d5d5");
  gradient.addColorStop(1, "#e6efc8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 960, 540);
  ctx.fillStyle = "#ffffff50";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(
      100 + i * 210 + Math.sin(t * 0.15 + i) * 12,
      95 + (i % 2) * 35,
      80,
      22,
      0,
      0,
      7,
    );
    ctx.fill();
  }
  ctx.fillStyle = "#85b9aa55";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  for (let x = 0; x <= 960; x += 20)
    ctx.lineTo(x, 360 + Math.sin(x * 0.009) * 45);
  ctx.lineTo(960, 540);
  ctx.lineTo(0, 540);
  ctx.fill();
  for (const p of world.level.platforms) {
    round(p.x, p.y, p.w, p.h, 8, "#537568");
    round(p.x, p.y, p.w, 8, 5, "#83b572");
    for (let x = p.x + 15; x < p.x + p.w; x += 38) {
      text("·", x, p.y + 22, 18, "#b9ce8b");
    }
    if (p.h < 30) {
      ctx.strokeStyle = "#75998977";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 12, p.y + p.h);
      ctx.lineTo(p.x + 20, p.y + 60);
      ctx.stroke();
    }
  }
  for (let i = 0; i < world.level.beacons.length; i++) {
    const b = world.level.beacons[i],
      lit = world.lit[i],
      color = b.role === 0 ? "#efb43b" : "#a487d7";
    if (lit) {
      ctx.fillStyle = b.role === 0 ? "#ffdc6360" : "#c2a1ff60";
      ctx.beginPath();
      ctx.arc(b.x, b.y - 27, 36 + Math.sin(t * 3) * 3, 0, 7);
      ctx.fill();
    }
    round(b.x - 5, b.y - 25, 10, 25, 4, "#567465");
    round(b.x - 17, b.y - 46, 34, 32, 10, lit ? color : "#eff3de");
    text(b.role === 0 ? "☀" : "☾", b.x, b.y - 23, 22, lit ? "#fff8db" : color);
    text(lit ? "✓" : b.role === 0 ? "E" : "↵", b.x, b.y - 55, 13, "#34554f");
  }
  for (const g of world.level.gates) {
    if (g.links.every((i) => world.lit[i])) {
      round(g.x, g.y + g.h - 6, g.w, 6, 3, "#81b7a3");
      continue;
    }
    round(g.x, g.y, g.w, g.h, 6, "#436961");
    for (let y = g.y + 12; y < g.y + g.h; y += 22)
      text("✦", g.x + g.w / 2, y, 13, "#c7e3c1");
  }
  const d = world.level.portal,
    ready = world.key && world.lit.every(Boolean);
  round(d.x, d.y, d.w, d.h, 35, "#426f65");
  round(d.x + 9, d.y + 9, d.w - 18, d.h - 9, 29, ready ? "#fff3b9" : "#a6c4aa");
  text(
    ready ? "✦" : "⌑",
    d.x + d.w / 2,
    d.y + 47,
    28,
    ready ? "#d7a546" : "#567a70",
  );
  text("TOGETHER", d.x + d.w / 2, d.y - 12, 10, "#42655b");
  if (!world.key) {
    const k = world.level.key;
    text("⚿", k.x, k.y + Math.sin(t * 3) * 3, 34, "#b88b27");
    text("KEY", k.x, k.y - 23, 9, "#587166");
  }
  world.players.forEach((p, i) => {
    const color = i === 0 ? "#ffc454" : "#b899e7";
    ctx.fillStyle = "#36595122";
    ctx.beginPath();
    ctx.ellipse(p.x + 13, p.y + 34, 18, 5, 0, 0, 7);
    ctx.fill();
    const bob = p.grounded && !reduced ? Math.sin(t * 5 + i) * 1.3 : 0;
    round(p.x, p.y + bob, 26, 29, 10, color);
    round(p.x + 3, p.y + 26, 7, 6, 3, i === 0 ? "#bd8635" : "#8067aa");
    round(p.x + 17, p.y + 26, 7, 6, 3, i === 0 ? "#bd8635" : "#8067aa");
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x + 13, p.y);
    ctx.lineTo(p.x + 13, p.y - 6);
    ctx.stroke();
    text(i === 0 ? "✦" : "✧", p.x + 13, p.y - 8, 14, color);
    ctx.fillStyle = "#374f53";
    ctx.beginPath();
    ctx.arc(p.x + 8 + (p.vx > 0 ? 1 : 0), p.y + 12 + bob, 2, 0, 7);
    ctx.arc(p.x + 18 + (p.vx > 0 ? 1 : 0), p.y + 12 + bob, 2, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#79584f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x + 13, p.y + 18 + bob, 3, 0, Math.PI);
    ctx.stroke();
    text(i === 0 ? "SOL" : "LUNA", p.x + 13, p.y - 25, 10, "#345e58");
    if (solo && active === i) text("▼", p.x + 13, p.y - 39, 13, "#42645e");
  });
  const lit = world.lit.filter(Boolean).length;
  el("status").textContent =
    `${world.key ? "⚿ Key found" : "⚿ Find the key"}${world.lit.length ? ` · ${lit}/${world.lit.length} lights` : ""}`;
}
let last = 0;
function frame(now: number) {
  const elapsed = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (playing) {
    for (let remaining = clock.advance(elapsed); remaining > 0; remaining--) {
      const before = world.lit.filter(Boolean).length,
        hadKey = world.key;
      step(world, [input(0), input(1)]);
      keys.tick();
      if (world.lit.filter(Boolean).length > before) tone(620);
      if (!hadKey && world.key) tone(740);

      if (world.won) {
        complete();
        break;
      }
    }
  }
  draw(now);
  requestAnimationFrame(frame);
}
load(0);
startMenu();
requestAnimationFrame(frame);
