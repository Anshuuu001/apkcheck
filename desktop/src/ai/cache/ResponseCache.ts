export class ResponseCache {
  private static cache = new Map<string, any>();

  static get<T>(key: string): T | null {
    return (this.cache.get(key) as T) || null;
  }

  static set(key: string, data: any): void {
    this.cache.set(key, data);
  }

  static clear(): void {
    this.cache.clear();
  }
}
