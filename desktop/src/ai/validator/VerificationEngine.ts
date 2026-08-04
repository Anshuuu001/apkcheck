import type { AppBlueprint } from '../../blueprint/schema';

export interface VerificationIssue {
  type: 'import' | 'navigation' | 'api-mismatch' | 'duplicate-route' | 'unused-component' | 'missing-asset';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
}

export class VerificationEngine {
  verify(blueprint: AppBlueprint, files: Record<string, string>): VerificationIssue[] {
    const issues: VerificationIssue[] = [];

    // 1. Check for Duplicate Routing Paths
    const routes = new Set<string>();
    blueprint.screens.forEach(screen => {
      if (routes.has(screen.route)) {
        issues.push({
          type: 'duplicate-route',
          severity: 'error',
          message: `Duplicate route path detected: '${screen.route}' on screen '${screen.name}'`,
          file: `src/screens/${screen.name}.tsx`
        });
      } else {
        routes.add(screen.route);
      }
    });

    // 2. Check for Broken Navigation Paths in eventHandlers
    const screenNames = new Set(blueprint.screens.map(s => s.name));
    blueprint.screens.forEach(screen => {
      screen.components.forEach(comp => {
        if (comp.eventHandlers) {
          Object.entries(comp.eventHandlers).forEach(([event, action]) => {
            if (action && action.startsWith('navigateTo:')) {
              const target = action.split(':')[1];
              if (!screenNames.has(target) && !screenNames.has(target + 'Screen')) {
                issues.push({
                  type: 'navigation',
                  severity: 'error',
                  message: `Broken navigation reference in ${comp.type} (${event}): target screen '${target}' does not exist.`,
                  file: `src/screens/${screen.name}.tsx`
                });
              }
            }
          });
        }
      });
    });

    // 3. Static Code Imports Check (e.g. searching for imports in react native files)
    Object.entries(files).forEach(([filePath, content]) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Simple search for unresolved components / missing imports
        const matches = content.match(/<DS[A-Z][a-zA-Z]+/g);
        if (matches) {
          matches.forEach(m => {
            const compName = m.substring(1);
            if (!content.includes(`import {`) && !content.includes(compName)) {
              issues.push({
                type: 'import',
                severity: 'warning',
                message: `Component <${compName}> is used but might be missing an explicit import.`,
                file: filePath
              });
            }
          });
        }
      }
    });

    // 4. API/DB Mismatches (checking table endpoints)
    if (blueprint.api && blueprint.database) {
      const tableNames = new Set(blueprint.database.tables.map(t => t.name.toLowerCase()));
      blueprint.api.endpoints.forEach(ep => {
        const pathSegments = ep.path.split('/');
        // Check if path segment resembles a database table but isn't there
        pathSegments.forEach(seg => {
          const cleanSeg = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanSeg && cleanSeg !== 'api' && cleanSeg !== 'v1' && !tableNames.has(cleanSeg) && !tableNames.has(cleanSeg + 's')) {
            // Check if it's a known table singular/plural
            const matchesTableCloseName = Array.from(tableNames).some(t => t.startsWith(cleanSeg) || cleanSeg.startsWith(t));
            if (!matchesTableCloseName && ep.path.includes(seg) && seg.length > 3) {
              issues.push({
                type: 'api-mismatch',
                severity: 'warning',
                message: `API Endpoint path segment '${seg}' has no matching database table.`,
                file: 'api-plan.json'
              });
            }
          }
        });
      });
    }

    // 5. Unused Components Check
    const componentsUsed = new Set<string>();
    blueprint.screens.forEach(screen => {
      screen.components.forEach(comp => {
        componentsUsed.add(comp.type);
        if (comp.children) {
          comp.children.forEach(child => componentsUsed.add(child.type));
        }
      });
    });

    // We check if standard registries have components not mapped
    const registryComponents = ['Card', 'List', 'Form', 'Button', 'Input'];
    registryComponents.forEach(rc => {
      if (!componentsUsed.has(rc) && !componentsUsed.has(rc + 'Field')) {
        issues.push({
          type: 'unused-component',
          severity: 'info',
          message: `Standard UI Component type '${rc}' is registered but unused in the current screens blueprint.`,
          file: 'schema.json'
        });
      }
    });

    return issues;
  }
}
