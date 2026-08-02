import type { DatabaseTable } from '../../blueprint/schema';

export class DtoGenerator {
  static generate(table: DatabaseTable, packageName: string): string {
    const className = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, '') + 'DTO';
    const fieldsCode = table.fields.map(field => {
      let javaType = 'String';
      if (field.type === 'BIGINT') javaType = 'Long';
      else if (field.type === 'INTEGER') javaType = 'Integer';
      else if (field.type === 'DECIMAL' || field.type === 'FLOAT') javaType = 'Double';
      else if (field.type === 'BOOLEAN') javaType = 'Boolean';
      else if (field.type === 'TIMESTAMP' || field.type === 'DATETIME') javaType = 'java.time.LocalDateTime';
      else if (field.type === 'DATE') javaType = 'java.time.LocalDate';

      return `    private ${javaType} ${field.name};`;
    }).join('\n\n');

    return `package ${packageName}.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class ${className} implements Serializable {

${fieldsCode}

}
`;
  }
}
