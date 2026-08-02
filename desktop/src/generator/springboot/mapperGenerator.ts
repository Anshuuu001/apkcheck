import type { DatabaseTable } from '../../blueprint/schema';

export class MapperGenerator {
  static generate(table: DatabaseTable, packageName: string): string {
    const baseName = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, '');
    const entityName = baseName;
    const dtoName = baseName + 'DTO';
    const className = baseName + 'Mapper';

    return `package ${packageName}.mapper;

import ${packageName}.entity.${entityName};
import ${packageName}.dto.${dtoName};
import org.springframework.stereotype.Component;

@Component
public class ${className} {

    public ${dtoName} toDTO(${entityName} entity) {
        if (entity == null) return null;
        ${dtoName} dto = new ${dtoName}();
        // Dynamic map mapping could be used, or basic setters
        return dto;
    }

    public ${entityName} toEntity(${dtoName} dto) {
        if (dto == null) return null;
        ${entityName} entity = new ${entityName}();
        return entity;
    }
}
`;
  }
}
