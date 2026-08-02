import type { DatabaseTable } from '../../blueprint/schema';

export function generateServiceJava(table: DatabaseTable, packagePath: string): string {
  const entityName = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, ''); // User
  const varName = entityName.toLowerCase();

  return `
package ${packagePath}.service;

import ${packagePath}.model.${entityName};
import ${packagePath}.repository.${entityName}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ${entityName}Service {

    private final ${entityName}Repository repository;

    @Autowired
    public ${entityName}Service(${entityName}Repository repository) {
        this.repository = repository;
    }

    public List<${entityName}> findAll() {
        return repository.findAll();
    }

    public Optional<${entityName}> findById(Long id) {
        return repository.findById(id);
    }

    public ${entityName} save(${entityName} ${varName}) {
        return repository.save(${varName});
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
`.trim();
}
