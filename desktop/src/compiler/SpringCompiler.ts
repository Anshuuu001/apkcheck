import type { AppBlueprint, ApiEndpoint, ApiPlan } from '../blueprint/schema';

/**
 * SpringCompiler — Deterministic Spring Boot Backend Generator.
 *
 * Blueprint.api → Full Java Spring Boot project:
 * - Controller (REST endpoints)
 * - Service (Business logic)
 * - Repository (JPA)
 * - Entity (JPA annotations)
 * - DTO (Request + Response)
 * - SecurityConfig (JWT)
 * - SwaggerConfig (OpenAPI 3.0)
 * - application.yml
 */
export class SpringCompiler {

  static compile(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};
    const { api, name: appName, database } = blueprint;

    const basePackage = blueprint.packageName.replace(/-/g, '_') || 'com.appforge.app';
    const basePath = `src/main/java/${basePackage.replace(/\./g, '/')}`;

    // ── 1. Group endpoints by tag (module) ────────────────────────────────
    const modules = SpringCompiler.groupByTag(api.endpoints);

    modules.forEach((endpoints, tag) => {
      const entityName = SpringCompiler.toPascalCase(tag);
      const modulePath = `${basePath}/${tag.toLowerCase()}`;

      // Controller
      files[`${modulePath}/controller/${entityName}Controller.java`] =
        SpringCompiler.generateController(entityName, endpoints, basePackage, tag.toLowerCase());

      // Service
      files[`${modulePath}/service/${entityName}Service.java`] =
        SpringCompiler.generateService(entityName, endpoints, basePackage, tag.toLowerCase());

      // Repository
      files[`${modulePath}/repository/${entityName}Repository.java`] =
        SpringCompiler.generateRepository(entityName, basePackage, tag.toLowerCase());

      // DTOs
      const postEndpoints = endpoints.filter(e => e.method === 'POST' || e.method === 'PUT');
      if (postEndpoints.length > 0) {
        files[`${modulePath}/dto/${entityName}RequestDto.java`] =
          SpringCompiler.generateRequestDto(entityName, postEndpoints[0], basePackage, tag.toLowerCase());
      }
      files[`${modulePath}/dto/${entityName}ResponseDto.java`] =
        SpringCompiler.generateResponseDto(entityName, endpoints[0], basePackage, tag.toLowerCase());

      // Entity (if linked to DB table)
      const linkedTable = database.tables.find(t =>
        t.name.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(t.name.toLowerCase())
      );
      if (linkedTable) {
        files[`${modulePath}/entity/${entityName}.java`] =
          SpringCompiler.generateEntity(entityName, linkedTable, basePackage, tag.toLowerCase());
      }
    });

    // ── 2. Security config ─────────────────────────────────────────────────
    files[`${basePath}/config/SecurityConfig.java`] =
      SpringCompiler.generateSecurityConfig(basePackage, api.endpoints);

    // ── 3. Swagger / OpenAPI config ────────────────────────────────────────
    files[`${basePath}/config/SwaggerConfig.java`] =
      SpringCompiler.generateSwaggerConfig(basePackage, blueprint.name, blueprint.description);

    // ── 4. JWT utilities ───────────────────────────────────────────────────
    files[`${basePath}/security/JwtUtil.java`] = SpringCompiler.generateJwtUtil(basePackage);
    files[`${basePath}/security/JwtFilter.java`] = SpringCompiler.generateJwtFilter(basePackage);

    // ── 5. application.yml ─────────────────────────────────────────────────
    files['src/main/resources/application.yml'] =
      SpringCompiler.generateApplicationYml(blueprint.name, blueprint.packageName);

    // ── 6. pom.xml ────────────────────────────────────────────────────────
    files['pom.xml'] = SpringCompiler.generatePomXml(blueprint.packageName, blueprint.name);

    return files;
  }

  // ── Controller ────────────────────────────────────────────────────────────

  private static generateController(entity: string, endpoints: ApiEndpoint[], basePackage: string, module: string): string {
    const methods = endpoints.map(ep => {
      const annotation = SpringCompiler.httpAnnotation(ep);
      const pathParam = ep.pathParams?.[0];
      const param = pathParam ? `, @PathVariable ${pathParam.type} ${pathParam.name}` : '';
      const body = (ep.method === 'POST' || ep.method === 'PUT') && ep.requestBody?.length
        ? `, @Valid @RequestBody ${entity}RequestDto request`
        : '';
      const auth = ep.auth === 'public' ? '' : `// Requires: ${ep.auth} role\n    `;

      return `    /**
     * ${ep.summary}
     * ${ep.description ?? ''}
     */
    ${annotation}
    public ResponseEntity<?> ${SpringCompiler.toMethodName(ep)}(${param}${body}) {
        ${auth}return ResponseEntity.ok(${module}Service.${SpringCompiler.toMethodName(ep)}(${pathParam ? pathParam.name + ', ' : ''}${ep.requestBody?.length ? 'request' : ''}));
    }`;
    }).join('\n\n');

    return `package ${basePackage}.${module}.controller;

import ${basePackage}.${module}.dto.*;
import ${basePackage}.${module}.service.${entity}Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/${module}")
@RequiredArgsConstructor
public class ${entity}Controller {

    private final ${entity}Service ${module}Service;

${methods}
}
`;
  }

  // ── Service ───────────────────────────────────────────────────────────────

  private static generateService(entity: string, endpoints: ApiEndpoint[], basePackage: string, module: string): string {
    const methods = endpoints.map(ep => {
      const pathParam = ep.pathParams?.[0];
      const param = pathParam ? `${pathParam.type} ${pathParam.name}` : '';
      const bodyParam = (ep.method === 'POST' || ep.method === 'PUT') && ep.requestBody?.length
        ? `${entity}RequestDto request`
        : '';
      const allParams = [param, bodyParam].filter(Boolean).join(', ');
      const returnType = ep.method === 'DELETE' ? 'void' : ep.method === 'GET' && !pathParam ? `List<${entity}ResponseDto>` : `${entity}ResponseDto`;

      return `    public ${returnType} ${SpringCompiler.toMethodName(ep)}(${allParams}) {
        // TODO: Implement ${ep.summary}
        throw new UnsupportedOperationException("${ep.summary} — not yet implemented");
    }`;
    }).join('\n\n');

    return `package ${basePackage}.${module}.service;

import ${basePackage}.${module}.dto.*;
import ${basePackage}.${module}.repository.${entity}Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ${entity}Service {

    private final ${entity}Repository ${module}Repository;

${methods}
}
`;
  }

  // ── Repository ────────────────────────────────────────────────────────────

  private static generateRepository(entity: string, basePackage: string, module: string): string {
    return `package ${basePackage}.${module}.repository;

import ${basePackage}.${module}.entity.${entity};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ${entity}Repository extends JpaRepository<${entity}, Long> {

    Optional<${entity}> findByEmail(String email);

    List<${entity}> findByStatus(String status);

    @Query("SELECT e FROM ${entity} e WHERE e.createdAt >= :since")
    List<${entity}> findRecentEntries(java.time.LocalDateTime since);
}
`;
  }

  // ── Request DTO ───────────────────────────────────────────────────────────

  private static generateRequestDto(entity: string, ep: ApiEndpoint, basePackage: string, module: string): string {
    const fields = ep.requestBody?.map(f => {
      const javaType = SpringCompiler.toJavaType(f.type);
      const validation = f.required ? `    @NotBlank\n` : '';
      return `${validation}    private ${javaType} ${f.name};`;
    }).join('\n\n') ?? '    // No request fields defined';

    return `package ${basePackage}.${module}.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

@Data
public class ${entity}RequestDto {

${fields}
}
`;
  }

  // ── Response DTO ──────────────────────────────────────────────────────────

  private static generateResponseDto(entity: string, ep: ApiEndpoint, basePackage: string, module: string): string {
    const fields = ep.responseFields?.map(f => {
      return `    private ${SpringCompiler.toJavaType(f.type)} ${f.name};`;
    }).join('\n') ?? `    private Long id;\n    private String createdAt;`;

    return `package ${basePackage}.${module}.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class ${entity}ResponseDto {

${fields}
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
`;
  }

  // ── Entity ────────────────────────────────────────────────────────────────

  private static generateEntity(entity: string, table: any, basePackage: string, module: string): string {
    const fields = table.fields?.map((f: any) => {
      const javaType = SpringCompiler.dbTypeToJava(f.type);
      const colAnnotation = f.unique ? `    @Column(unique = true)\n` : '    @Column\n';
      if (f.primaryKey) {
        return `    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long ${f.name};`;
      }
      return `${colAnnotation}    private ${javaType} ${SpringCompiler.toCamelCase(f.name)};`;
    }).join('\n\n') ?? '    private Long id;';

    return `package ${basePackage}.${module}.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${table.name}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ${entity} {

${fields}

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
`;
  }

  // ── Security Config ───────────────────────────────────────────────────────

  private static generateSecurityConfig(basePackage: string, endpoints: ApiEndpoint[]): string {
    const publicPaths = endpoints
      .filter(e => e.auth === 'public')
      .map(e => `"${e.path}"`)
      .join(', ');

    return `package ${basePackage}.config;

import ${basePackage}.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers(${publicPaths || '"/api/auth/**"'}).permitAll()
                .antMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
`;
  }

  // ── Swagger Config ────────────────────────────────────────────────────────

  private static generateSwaggerConfig(basePackage: string, appName: string, description: string): string {
    return `package ${basePackage}.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("${appName} API")
                .description("${description}")
                .version("1.0.0"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
`;
  }

  // ── JWT Utilities ─────────────────────────────────────────────────────────

  private static generateJwtUtil(basePackage: string): string {
    return `package ${basePackage}.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("\${jwt.secret}")
    private String secret;

    @Value("\${jwt.expiration}")
    private long expiration;

    public String generateToken(String email, String role) {
        return Jwts.builder()
            .setSubject(email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }

    public String getEmail(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
`;
  }

  private static generateJwtFilter(basePackage: string): string {
    return `package ${basePackage}.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, javax.servlet.ServletException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.getEmail(token);
                var auth = new UsernamePasswordAuthenticationToken(email, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
`;
  }

  // ── application.yml ───────────────────────────────────────────────────────

  private static generateApplicationYml(appName: string, packageName: string): string {
    return `spring:
  application:
    name: ${appName.toLowerCase().replace(/\s+/g, '-')}
  datasource:
    url: jdbc:mysql://localhost:3306/${packageName.replace(/\./g, '_')}?useSSL=false&serverTimezone=UTC
    username: \${DB_USERNAME:root}
    password: \${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

jwt:
  secret: \${JWT_SECRET:your-super-secret-key-change-in-production}
  expiration: 86400000 # 24 hours in milliseconds

server:
  port: 8080
  error:
    include-message: always

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html

logging:
  level:
    org.hibernate.SQL: DEBUG
    com.appforge: DEBUG
`;
  }

  // ── pom.xml ───────────────────────────────────────────────────────────────

  private static generatePomXml(packageName: string, appName: string): string {
    const groupId = packageName.split('.').slice(0, 2).join('.');
    const artifactId = appName.toLowerCase().replace(/\s+/g, '-');

    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.5</version>
    <relativePath/>
  </parent>

  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>1.0.0</version>
  <name>${appName}</name>
  <description>Generated by AppForge AI</description>

  <properties>
    <java.version>17</java.version>
  </properties>

  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt</artifactId><version>0.9.1</version></dependency>
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
    <dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>2.2.0</version></dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private static groupByTag(endpoints: ApiEndpoint[]): Map<string, ApiEndpoint[]> {
    const map = new Map<string, ApiEndpoint[]>();
    endpoints.forEach(ep => {
      const tag = ep.tag || 'Common';
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(ep);
    });
    return map;
  }

  private static httpAnnotation(ep: ApiEndpoint): string {
    const path = ep.path.replace(/^\/api\/[^/]+/, '') || '/';
    const pathStr = path !== '/' ? `("${path}")` : '';
    switch (ep.method) {
      case 'GET':    return `@GetMapping${pathStr}`;
      case 'POST':   return `@PostMapping${pathStr}`;
      case 'PUT':    return `@PutMapping${pathStr}`;
      case 'PATCH':  return `@PatchMapping${pathStr}`;
      case 'DELETE': return `@DeleteMapping${pathStr}`;
    }
  }

  private static toMethodName(ep: ApiEndpoint): string {
    const action = {
      GET: ep.pathParams?.length ? 'getById' : 'getAll',
      POST: 'create',
      PUT: 'update',
      PATCH: 'patch',
      DELETE: 'delete',
    }[ep.method] ?? 'handle';
    return action;
  }

  private static toPascalCase(str: string): string {
    return str.replace(/(^\w|[_\s]\w)/g, m => m.replace(/[_\s]/, '').toUpperCase());
  }

  private static toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  }

  private static toJavaType(type: string): string {
    const map: Record<string, string> = {
      string: 'String', String: 'String',
      number: 'Long', integer: 'Integer', int: 'Integer',
      boolean: 'Boolean',
      object: 'Object',
    };
    return map[type] ?? 'String';
  }

  private static dbTypeToJava(type: string): string {
    const map: Record<string, string> = {
      INTEGER: 'Long', BIGINT: 'Long', VARCHAR: 'String', TEXT: 'String',
      BOOLEAN: 'Boolean', DECIMAL: 'java.math.BigDecimal', FLOAT: 'Double',
      DATE: 'java.time.LocalDate', DATETIME: 'java.time.LocalDateTime',
      TIMESTAMP: 'java.time.LocalDateTime', JSON: 'String', UUID: 'java.util.UUID',
      ENUM: 'String',
    };
    return map[type] ?? 'String';
  }
}
