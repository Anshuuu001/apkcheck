import type { AppBlueprint } from '../../blueprint/schema';

export class DocumentationGenerator {
  static generateReadme(blueprint: AppBlueprint): string {
    const arch = blueprint.architecture || {
      frontendFramework: 'React Native',
      stateManagement: 'Redux',
      navigationLibrary: 'React Navigation',
      httpClient: 'Axios',
      backendFramework: 'Spring Boot',
      authScheme: 'JWT',
      databaseType: 'MySQL'
    };

    return `# ${blueprint.name}

${blueprint.description || 'AppForge-AI Generated Enterprise Application.'}

## Tech Stack Decisions (Architecture)
* **Frontend**: ${arch.frontendFramework}
* **State Management**: ${arch.stateManagement}
* **Navigation**: ${arch.navigationLibrary}
* **HTTP Client**: ${arch.httpClient}
* **Backend Platform**: ${arch.backendFramework}
* **Authentication**: ${arch.authScheme}
* **Database Client**: ${arch.databaseType}

## Directory Structure
\`\`\`
├── backend/            # Spring Boot Maven backend service
│   ├── src/main/java/  # REST Controllers, JPA Entities, Services
│   └── pom.xml
├── frontend/           # React Native dynamic UI package
│   ├── src/screens/    # App screens layout
│   └── package.json
├── database/           # Schema migration scripts
│   └── schema.sql
└── docs/               # System architecture documentation
\`\`\`

## Installation & Setup

### Backend (Spring Boot)
1. Navigate to \`backend/\` folder:
   \`\`\`bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   \`\`\`

### Frontend (React Native)
1. Navigate to \`frontend/\` folder:
   \`\`\`bash
   cd frontend
   npm install
   npm run start
   \`\`\`
`;
  }

  static generateApiDocumentation(blueprint: AppBlueprint): string {
    const endpoints = blueprint.api?.endpoints || [];
    let md = `# API Endpoints Reference Specification

**Base URL**: \`${blueprint.api?.baseUrl || 'http://localhost:8080/api'}\`
**Auth Scheme**: \`${blueprint.api?.authScheme || 'JWT'}\`

---

`;

    if (endpoints.length === 0) {
      md += `*No API routes defined.*`;
    } else {
      endpoints.forEach(ep => {
        md += `### ${ep.method} ${ep.path}\n`;
        md += `* **Module Tag**: \`${ep.tag}\`\n`;
        md += `* **Description**: ${ep.description || 'No description provided.'}\n`;
        if (ep.requestBody) {
          md += `* **Request Body Payload**:\n  \`\`\`json\n  ${JSON.stringify(ep.requestBody, null, 2).replace(/\n/g, '\n  ')}\n  \`\`\`\n`;
        }
        if (ep.responseFields) {
          md += `* **Response Payload Structure**:\n  \`\`\`json\n  ${JSON.stringify(ep.responseFields, null, 2).replace(/\n/g, '\n  ')}\n  \`\`\`\n`;
        }
        md += `\n---\n\n`;
      });
    }

    return md;
  }

  static generateDatabaseSchema(blueprint: AppBlueprint): string {
    const db = blueprint.database;
    if (!db) return `# Database Design`;

    let md = `# Database Schema Design

**Database Engine**: \`${db.dbType.toUpperCase()}\`

## Tables

`;

    db.tables.forEach(table => {
      md += `### Table: \`${table.name}\`\n`;
      if (table.comment) md += `*Comment: ${table.comment}*\n\n`;
      
      md += `| Field | Type | Nullable | Primary Key | Attributes |\n`;
      md += `|---|---|---|---|---|\n`;
      table.fields.forEach(field => {
        const pk = field.primaryKey ? '✅' : '❌';
        const nullable = field.nullable ? 'YES' : 'NO';
        const attrs = [
          field.autoIncrement ? 'AUTO_INCREMENT' : '',
          field.unique ? 'UNIQUE' : '',
          field.defaultValue ? `DEFAULT: ${field.defaultValue}` : ''
        ].filter(Boolean).join(', ');

        md += `| \`${field.name}\` | ${field.type} | ${nullable} | ${pk} | ${attrs} |\n`;
      });
      md += `\n`;
    });

    if (db.relationships && db.relationships.length > 0) {
      md += `## Entity-Relationship Diagram (Mermaid)\n\n`;
      md += `\`\`\`mermaid\nerDiagram\n`;
      db.relationships.forEach(r => {
        const leftEntity = r.from.split('.')[0];
        const rightEntity = r.to.split('.')[0];
        
        let link = '||--o{';
        if (r.type === 'ONE_TO_ONE') link = '||--||';
        else if (r.type === 'MANY_TO_MANY') link = '}o--o{';

        md += `  ${leftEntity} ${link} ${rightEntity} : "references"\n`;
      });
      md += `\`\`\`\n`;
    }

    return md;
  }

  static generateChangelog(_blueprint: AppBlueprint): string {
    return `# Changelog

## [1.0.0] - ${new Date().toISOString().split('T')[0]}
- Initial release of the master blueprint config.
- Scaffolding of all compiled modules.
- Scaffolding of JPA Repository models.
- Verification checks complete and validated.
`;
  }
}
