import type { DatabaseTable } from '../../blueprint/schema';

export function generateRepositoryJava(table: DatabaseTable, packagePath: string): string {
  const entityName = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, ''); // e.g., users -> User
  
  return `
package ${packagePath}.repository;

import ${packagePath}.model.${entityName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ${entityName}Repository extends JpaRepository<${entityName}, Long> {
    ${table.name === 'users' ? 'Optional<User> findByEmail(String email);' : ''}
}
`.trim();
}
