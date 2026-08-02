/**
 * AppForge-AI — Blueprint Validator V2
 * 
 * Validates the generated app blueprint for structural compliance, schema correctness,
 * and internal references. Automatically repairs minor errors.
 */

import type { AppBlueprint, DatabaseTable, ApiEndpoint } from '../../blueprint/schema';
import { validateBlueprint, generateId } from '../../blueprint/parser';

export class BlueprintValidator {
  
  validate(blueprint: AppBlueprint): { valid: boolean; errors: string[] } {
    // 1. Core structural validate
    const baseResult = validateBlueprint(blueprint);
    const errors = [...baseResult.errors];

    // 2. V2-specific referential checks
    // Verify that screen API calls map to valid API endpoints
    const endpointIds = new Set(blueprint.api.endpoints.map(e => e.id));
    const endpointPaths = new Set(blueprint.api.endpoints.map(e => e.path));
    
    blueprint.screens.forEach(screen => {
      if (screen.apiCalls) {
        screen.apiCalls.forEach(callId => {
          if (!endpointIds.has(callId) && !endpointPaths.has(callId)) {
            errors.push(`Screen "${screen.name}" calls undefined API endpoint "${callId}"`);
          }
        });
      }
    });

    // Verify database table foreign keys point to valid tables
    const tableNames = new Set(blueprint.database.tables.map(t => t.name));
    blueprint.database.tables.forEach(table => {
      if (table.foreignKeys) {
        table.foreignKeys.forEach(fk => {
          if (!tableNames.has(fk.referencesTable)) {
            errors.push(`Table "${table.name}" has foreign key pointing to undefined table "${fk.referencesTable}"`);
          }
        });
      }
    });

    // 3. Industry-specific intelligent checks
    const nameLower = blueprint.name.toLowerCase();
    const descLower = blueprint.description.toLowerCase();
    const bpUsers = blueprint.users.map(u => u.toLowerCase());
    const tables = blueprint.database.tables.map(t => t.name.toLowerCase());
    const compTypes = blueprint.screens.flatMap(s => s.components.map(c => c.type));
    const features = (blueprint.intentResult?.suggestedFeatures || blueprint.requirementAnswers?.features || []).map(f => f.toLowerCase());

    const isHospital = nameLower.includes('hospital') || nameLower.includes('health') || descLower.includes('health') || descLower.includes('hospital') || nameLower.includes('healthcare');
    const isDelivery = nameLower.includes('delivery') || nameLower.includes('food') || descLower.includes('delivery') || nameLower.includes('restaurant') || nameLower.includes('pizza');
    const isEcom = nameLower.includes('shop') || nameLower.includes('commerce') || nameLower.includes('store') || descLower.includes('commerce') || nameLower.includes('store') || nameLower.includes('e-commerce');
    const isTaxi = nameLower.includes('taxi') || nameLower.includes('cab') || nameLower.includes('uber') || nameLower.includes('ride') || descLower.includes('ride');
    const isSchool = nameLower.includes('school') || nameLower.includes('student') || nameLower.includes('teacher') || descLower.includes('school') || descLower.includes('education');

    if (isHospital) {
      if (!bpUsers.some(u => u.includes('doctor'))) {
        errors.push('Missing Industry Role: Hospital apps must define a "Doctor" user portal.');
      }
      if (!bpUsers.some(u => u.includes('patient'))) {
        errors.push('Missing Industry Role: Hospital apps must define a "Patient" user portal.');
      }
      if (!tables.includes('appointments')) {
        errors.push('Missing Module: Hospital apps require an "appointments" database table for doctor scheduling.');
      }
      if (!tables.includes('prescriptions') && !tables.includes('medicine')) {
        errors.push('Missing Module: Hospital apps require a "prescriptions" table for medical treatments.');
      }
      if (!tables.includes('billing') && !tables.includes('invoices')) {
        errors.push('Missing Module: Hospital apps require a "billing" table for patient invoices.');
      }
      if (!tables.includes('lab_reports') && !tables.includes('reports')) {
        errors.push('Missing Module: Hospital apps require a "lab_reports" table for diagnostics.');
      }
      if (!compTypes.includes('Calendar') && !compTypes.includes('AppointmentCard')) {
        errors.push('Missing Component: Hospital screens require a "Calendar" or "AppointmentCard" widget for booking slots.');
      }
    }

    if (isDelivery) {
      if (!bpUsers.some(u => u.includes('driver')) && !bpUsers.some(u => u.includes('delivery'))) {
        errors.push('Missing Industry Role: Food Delivery apps must define a "Driver" role.');
      }
      if (!bpUsers.some(u => u.includes('restaurant')) && !bpUsers.some(u => u.includes('owner'))) {
        errors.push('Missing Industry Role: Food Delivery apps must define a "Restaurant Owner" dashboard.');
      }
      if (!tables.includes('orders')) {
        errors.push('Missing Module: Food Delivery apps require an "orders" database table.');
      }
      if (!tables.includes('delivery_tracking') && !tables.includes('coordinates')) {
        errors.push('Missing Module: Food Delivery apps require a "delivery_tracking" table for live GPS monitoring.');
      }
      if (!features.includes('wallet') && !features.includes('payment')) {
        errors.push('Missing Module: Food Delivery apps require a payment "wallet" or cards payment flow.');
      }
      if (!features.includes('coupons') && !features.includes('discounts')) {
        errors.push('Missing Module: Food Delivery apps should support "coupons" discount codes.');
      }
    }

    if (isEcom) {
      if (!bpUsers.some(u => u.includes('buyer')) && !bpUsers.some(u => u.includes('customer'))) {
        errors.push('Missing Industry Role: E-Commerce apps must define a "Buyer" portal.');
      }
      if (!bpUsers.some(u => u.includes('seller')) && !bpUsers.some(u => u.includes('vendor'))) {
        errors.push('Missing Industry Role: E-Commerce apps must define a "Seller" portal.');
      }
      if (!tables.includes('products')) {
        errors.push('Missing Module: E-Commerce apps require a "products" database catalog.');
      }
      if (!tables.includes('orders') && !tables.includes('cart')) {
        errors.push('Missing Module: E-Commerce apps require an "orders" database table.');
      }
      if (!compTypes.includes('CartItem') && !compTypes.includes('ProductCard')) {
        errors.push('Missing Component: E-Commerce screens require a "CartItem" or "ProductCard" grid widget.');
      }
    }

    if (isTaxi) {
      if (!bpUsers.some(u => u.includes('driver'))) {
        errors.push('Missing Industry Role: Taxi/Ride apps must define a "Driver" portal.');
      }
      if (!bpUsers.some(u => u.includes('passenger'))) {
        errors.push('Missing Industry Role: Taxi/Ride apps must define a "Passenger" portal.');
      }
      if (!tables.includes('rides')) {
        errors.push('Missing Module: Taxi/Ride apps require a "rides" database tracker.');
      }
      if (!tables.includes('coordinates') && !tables.includes('locations')) {
        errors.push('Missing Module: Taxi/Ride apps require a "coordinates" table for live travel tracking.');
      }
    }

    if (isSchool) {
      if (!bpUsers.some(u => u.includes('student'))) {
        errors.push('Missing Industry Role: School apps must define a "Student" portal.');
      }
      if (!bpUsers.some(u => u.includes('teacher'))) {
        errors.push('Missing Industry Role: School apps must define a "Teacher" portal.');
      }
      if (!tables.includes('attendance')) {
        errors.push('Missing Module: School apps require an "attendance" database log.');
      }
      if (!tables.includes('grades') && !tables.includes('exams')) {
        errors.push('Missing Module: School apps require a "grades" database log.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Automatically repairs structural inconsistencies in the blueprint.
   */
  autoFix(blueprint: AppBlueprint): { fixedBlueprint: AppBlueprint; fixedItems: string[] } {
    const fixedBlueprint = JSON.parse(JSON.stringify(blueprint)) as AppBlueprint;
    const fixedItems: string[] = [];

    const tableNames = new Set(fixedBlueprint.database.tables.map(t => t.name));
    const endpointPaths = new Set(fixedBlueprint.api.endpoints.map(e => e.path));

    // 1. Repair missing primary keys or created_at in tables
    fixedBlueprint.database.tables.forEach(table => {
      const hasId = table.fields.some(f => f.name === 'id' && f.primaryKey);
      if (!hasId) {
        table.fields.unshift({
          name: 'id',
          type: 'BIGINT',
          nullable: false,
          primaryKey: true,
          autoIncrement: true
        });
        fixedItems.push(`Added primary key "id" to table "${table.name}"`);
      }

      const hasCreatedAt = table.fields.some(f => f.name === 'created_at');
      if (!hasCreatedAt) {
        table.fields.push({
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        });
        fixedItems.push(`Added "created_at" field to table "${table.name}"`);
      }
    });

    // 2. Repair missing referenced foreign key tables
    fixedBlueprint.database.tables.forEach(table => {
      if (table.foreignKeys) {
        table.foreignKeys.forEach(fk => {
          if (!tableNames.has(fk.referencesTable)) {
            // Auto create standard stub table for references
            const newTable: DatabaseTable = {
              id: generateId('table'),
              name: fk.referencesTable,
              comment: `Auto-generated reference table for ${fk.referencesTable}`,
              fields: [
                { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
                { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
                { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
              ]
            };
            fixedBlueprint.database.tables.push(newTable);
            tableNames.add(fk.referencesTable);
            fixedItems.push(`Auto-created missing table "${fk.referencesTable}" referenced by "${table.name}"`);
          }
        });
      }
    });

    // 3. Repair missing API endpoints called by screens
    fixedBlueprint.screens.forEach(screen => {
      if (screen.apiCalls) {
        screen.apiCalls.forEach(callId => {
          // If callId is not mapped to path, create a stub endpoint
          const cleanPath = `/${callId.replace(/^get|^post|^put|^delete/i, '').toLowerCase()}`;
          if (!endpointPaths.has(cleanPath)) {
            const method = callId.toLowerCase().startsWith('get') ? 'GET' : 'POST';
            const newEp: ApiEndpoint = {
              id: generateId('ep'),
              path: cleanPath,
              method,
              tag: screen.name.replace(/Screen$/i, ''),
              summary: `Auto-generated endpoint for ${callId}`,
              auth: 'user',
              responseCode: method === 'POST' ? 201 : 200
            };
            fixedBlueprint.api.endpoints.push(newEp);
            endpointPaths.add(cleanPath);
            fixedItems.push(`Auto-created missing API endpoint "${cleanPath}" (${method}) called by "${screen.name}"`);
          }
        });
      }
    });

    return {
      fixedBlueprint,
      fixedItems
    };
  }
}
