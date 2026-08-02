export class TemplateLoader {
  private templates: Map<string, string> = new Map();

  register(name: string, template: string): void {
    this.templates.set(name, template);
  }

  load(name: string, variables: Record<string, string>): string {
    const raw = this.templates.get(name);
    if (!raw) {
      throw new Error(`Template not registered: ${name}`);
    }

    return raw.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`;
    });
  }
}
