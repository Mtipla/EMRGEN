/** Bounded cache of non-sensitive economic indicators, never location/medical data. */
export class AuxiliaryCache {
  private readonly items = new Map<string, { expires: number; value: Promise<unknown> }>();
  get<T>(key: string, load: () => Promise<T>): Promise<T> {
    const now = Date.now();
    for (const [k, entry] of this.items) if (entry.expires <= now) this.items.delete(k);
    const existing = this.items.get(key);
    if (existing) return existing.value as Promise<T>;
    if (this.items.size >= 128) this.items.delete(this.items.keys().next().value!);
    const value = load().catch(error => { this.items.delete(key); throw error; });
    this.items.set(key, { value, expires: now + 60_000 });
    return value;
  }
}
