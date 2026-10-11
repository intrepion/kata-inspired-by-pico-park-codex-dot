import type { World } from "./world";
export function render(
  ctx: CanvasRenderingContext2D,
  world: World,
  options: { time: number; reduced: boolean; solo: boolean; active: number },
) {
  const { time, reduced, solo, active } = options;
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
  for (const planter of world.planters) {
    round(
      planter.minX,
      planter.y + planter.h + 2,
      planter.maxX - planter.minX + planter.w,
      4,
      2,
      "#9eaa84",
    );
    round(planter.x, planter.y, planter.w, planter.h - 5, 5, "#b77b58");
    round(planter.x - 2, planter.y, planter.w + 4, 7, 3, "#d89e74");
    text("✿", planter.x + 17, planter.y - 2, 25, "#eabb6d");
    round(planter.x + 4, planter.y + planter.h - 6, 6, 6, 3, "#3d5f58");
    round(planter.x + 24, planter.y + planter.h - 6, 6, 6, 3, "#3d5f58");
    text(
      "PUSH →",
      (planter.minX + planter.maxX + 34) / 2,
      planter.y + planter.h + 18,
      9,
      "#56716a",
    );
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
}
