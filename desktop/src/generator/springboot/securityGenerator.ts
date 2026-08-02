export function generateSecurityConfigJava(packagePath: string): string {
  return `
package ${packagePath}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
`.trim();
}
export function generateEntityJava(tableName: string, fields: any[], packagePath: string): string {
  const entityName = tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/s$/, ''); // User
  
  const javaFields = fields.map(f => {
    let type = 'String';
    if (f.type === 'BIGINT') type = 'Long';
    else if (f.type === 'INTEGER') type = 'Integer';
    else if (f.type === 'BOOLEAN') type = 'Boolean';
    else if (f.type === 'DECIMAL') type = 'Double';
    else if (f.type === 'DATETIME' || f.type === 'TIMESTAMP') type = 'java.time.LocalDateTime';
    else if (f.type === 'DATE') type = 'java.time.LocalDate';

    const isId = f.primaryKey ? '@Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)' : '';

    return `
    ${isId}
    @Column(name = "${f.name}", nullable = ${f.nullable})
    private ${type} ${f.name.replace(/_([a-z])/g, (_m: any, c: string) => c.toUpperCase())};
    `.trim();
  }).join('\n\n    ');

  return `
package ${packagePath}.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "${tableName}")
@Data
public class ${entityName} {
    ${javaFields}
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
}
`.trim();
}
