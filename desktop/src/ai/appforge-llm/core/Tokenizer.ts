export class Tokenizer {
  /**
   * Simple tokenizer that cleans and splits text into unique keywords
   */
  static tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }
}
