export class Parser {
  /**
   * Sanitizes input strings
   */
  static clean(text: string): string {
    return text.trim();
  }

  /**
   * Validates and returns parsed JSON object
   */
  static parse<T>(jsonStr: string): T | null {
    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      return null;
    }
  }
}
