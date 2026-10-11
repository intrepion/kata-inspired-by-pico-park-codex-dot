export class InputBuffer {
  private held = new Set<string>();
  private queued = new Set<string>();
  down(key: string) {
    if (!this.held.has(key)) this.queued.add(key);
    this.held.add(key);
  }
  up(key: string) {
    this.held.delete(key);
  }
  has(key: string) {
    return this.held.has(key) || this.queued.has(key);
  }
  tick() {
    this.queued.clear();
  }
  clear() {
    this.held.clear();
    this.queued.clear();
  }
}
