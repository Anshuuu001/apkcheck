export class ResponseEngine {
  /**
   * Encapsulates data into standard stringified JSON responses
   */
  static format(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
