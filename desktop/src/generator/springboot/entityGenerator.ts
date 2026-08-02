import type { DatabaseTable } from '../../blueprint/schema';

export class EntityGenerator {
  static generate(table: DatabaseTable, packageName: string): string {
    const className = table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/s$/, ''); // Singularize
    const fieldsCode = table.fields.map(field => {
      let javaType = 'String';
      if (field.type === 'BIGINT') javaType = 'Long';
      else if (field.type === 'INTEGER') javaType = 'Integer';
      else if (field.type === 'DECIMAL' || field.type === 'FLOAT') javaType = 'Double';
      else if (field.type === 'BOOLEAN') javaType = 'Boolean';
      else if (field.type === 'TIMESTAMP' || field.type === 'DATETIME') javaType = 'java.time.LocalDateTime';
      else if (field.type === 'DATE') javaType = 'java.time.LocalDate';

      const annotations = [];
      if (field.primaryKey) {
        annotations.push('    @Id');
        if (field.autoIncrement) {
          annotations.push('    @GeneratedValue(strategy = GenerationType.IDENTITY)');
        }
      }
      
      const isUnique = field.unique ? ', unique = true' : '';
      const isNullable = field.nullable ? '' : ', nullable = false';
      annotations.push(`    @Column(name = "${field.name}"${isUnique}${isNullable})`);

      return `${annotations.join('\n')}\n    private ${javaType} ${field.name};`;
    }).join('\n\n');

    return `package ${packageName}.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "${table.name}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${className} {

${fieldsCode}

}
`;
  }
}
