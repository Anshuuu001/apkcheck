export class PromptCache {
  private static cache = new Map<string, { response: string; expires: number }>();

  /**
   * Retrieves cached response for a prompt if it exists and has not expired
   */
  static get(prompt: string): string | null {
    const key = prompt.trim().toLowerCase();
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  /**
   * Saves prompt-response pair to cache with dynamic TTL (defaults to 1 hour)
   */
  static set(prompt: string, response: string, ttlMs: number = 60 * 60 * 1000): void {
    const key = prompt.trim().toLowerCase();
    this.cache.set(key, {
      response,
      expires: Date.now() + ttlMs
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
