import { DT } from "./world";
export class TickClock {
  private remainder = 0;
  advance(seconds: number) {
    this.remainder += Math.max(0, Math.min(0.1, seconds));
    const ticks = Math.floor((this.remainder + 1e-10) / DT);
    this.remainder = Math.max(0, this.remainder - ticks * DT);
    return ticks;
  }
  clear() {
    this.remainder = 0;
  }
}
