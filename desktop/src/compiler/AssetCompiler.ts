export class AssetCompiler {
  static compile(icon?: string): string {
    return `// AppForge Static Asset References\nexport const AppLogo = ${icon ? `'${icon}'` : 'null'};\n`;
  }
}
