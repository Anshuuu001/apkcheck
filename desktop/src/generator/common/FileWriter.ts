export interface GeneratedFile {
  path: string;
  content: string;
}

export class FileWriter {
  /**
   * Helper to format file records into virtual workspace paths
   */
  static createVirtualFile(relativePath: string, content: string): GeneratedFile {
    return {
      path: relativePath,
      content: content.trim() + '\n',
    };
  }
}
