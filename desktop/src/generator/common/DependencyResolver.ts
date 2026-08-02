export class DependencyResolver {
  private npmDependencies: Record<string, string> = {};
  private mavenDependencies: string[] = [];

  addNpmDependency(pkg: string, version: string): void {
    this.npmDependencies[pkg] = version;
  }

  addMavenDependency(groupId: string, artifactId: string, version?: string): void {
    const verTag = version ? `<version>${version}</version>` : '';
    this.mavenDependencies.push(`
    <dependency>
        <groupId>${groupId}</groupId>
        <artifactId>${artifactId}</artifactId>
        ${verTag}
    </dependency>`);
  }

  resolveNpm(): Record<string, string> {
    return { ...this.npmDependencies };
  }

  resolveMaven(): string {
    return this.mavenDependencies.join('\n');
  }
}
