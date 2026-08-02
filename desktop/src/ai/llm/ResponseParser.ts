export class ResponseParser {
  /**
   * Cleans model output by stripping markdown block wrappers (like ```json ... ```)
   */
  static cleanRawText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/^```[a-zA-Z0-9]*\n?/, '') // removes starting ```json or ```
      .replace(/\n?```$/, '') // removes ending ```
      .trim();
  }

  /**
   * Safely parses JSON from raw model response text
   */
  static parseJSON<T>(text: string): T | null {
    const cleaned = this.cleanRawText(text);
    try {
      return JSON.parse(cleaned) as T;
    } catch (e) {
      console.error('[ResponseParser] Failed to parse JSON:', e, '\nCleaned Text was:', cleaned);
      return null;
    }
  }
}
