// Guarantee a fully working localStorage in the test env. jsdom/Node web-storage
// support varies (some builds expose a partial global without .clear()), so we
// install a deterministic in-memory Storage that the lib helpers read via the
// global `localStorage`. `window` is still provided by the jsdom environment, so
// the lib's `typeof window === "undefined"` SSR guard behaves like the browser.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
}
