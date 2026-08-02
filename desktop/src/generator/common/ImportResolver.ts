export class ImportResolver {
  private reactImports: Set<string> = new Set();
  private localImports: Map<string, string> = new Map(); // name -> path

  addReactImport(named: string): void {
    this.reactImports.add(named);
  }

  addLocalImport(named: string, fromPath: string): void {
    this.localImports.set(named, fromPath);
  }

  resolveTS(): string {
    const lines: string[] = [];
    if (this.reactImports.size > 0) {
      lines.push(`import { ${Array.from(this.reactImports).join(', ')} } from 'react';`);
    }

    // Group local imports by path
    const grouped = new Map<string, string[]>();
    this.localImports.forEach((path, name) => {
      if (!grouped.has(path)) {
        grouped.set(path, []);
      }
      grouped.get(path)!.push(name);
    });

    grouped.forEach((names, path) => {
      lines.push(`import { ${names.join(', ')} } from '${path}';`);
    });

    return lines.join('\n');
  }

  resolveJava(packageName: string): string {
    const lines: string[] = [];
    this.localImports.forEach((path, name) => {
      lines.push(`import ${packageName}.${path}.${name};`);
    });
    return lines.join('\n');
  }
}
