import type { AppBlueprint } from '../../blueprint/schema';
import { generateControllerJava } from './controllerGenerator';
import { generateServiceJava } from './serviceGenerator';
import { generateRepositoryJava } from './repositoryGenerator';
import { generateSecurityConfigJava, generateEntityJava } from './securityGenerator';
import type { CodeAssetFile } from '../react-native/appGenerator';

export function generateSpringBootProject(blueprint: AppBlueprint): CodeAssetFile[] {
  const files: CodeAssetFile[] = [];
  const packagePath = 'com.appforge.backend';
  const pkgDir = 'src/main/java/com/appforge/backend';

  // 1. Add Main Application class
  files.push({
    path: `${pkgDir}/BackendApplication.java`,
    content: `
package ${packagePath};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
`.trim(),
  });

  // 2. Add Security Config
  files.push({
    path: `${pkgDir}/config/SecurityConfig.java`,
    content: generateSecurityConfigJava(packagePath),
  });

  // 3. Add Entity, Repo, Service, Controller for each Database Table
  if (blueprint.database && blueprint.database.tables) {
    blueprint.database.tables.forEach(table => {
      const entityName = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, ''); // e.g. users -> User
      
      // Model Entity
      files.push({
        path: `${pkgDir}/model/${entityName}.java`,
        content: generateEntityJava(table.name, table.fields, packagePath),
      });

      // Repository
      files.push({
        path: `${pkgDir}/repository/${entityName}Repository.java`,
        content: generateRepositoryJava(table, packagePath),
      });

      // Service
      files.push({
        path: `${pkgDir}/service/${entityName}Service.java`,
        content: generateServiceJava(table, packagePath),
      });

      // Controller
      files.push({
        path: `${pkgDir}/controller/${entityName}Controller.java`,
        content: generateControllerJava(table, packagePath),
      });
    });
  }

  // 4. Add build files (pom.xml)
  files.push({
    path: 'pom.xml',
    content: `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.appforge</groupId>
    <artifactId>backend</artifactId>
    <version>1.0.0</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
`.trim(),
  });

  return files;
}
