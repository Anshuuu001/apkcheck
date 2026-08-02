import type { DatabaseTable, IndustryType } from '../../blueprint/schema';
import { generateId } from '../../blueprint/parser';

export function buildDatabase(features: string[], users: string[], authRequired: boolean, _industry: IndustryType): DatabaseTable[] {
  const tables: DatabaseTable[] = [];

  const addTable = (table: Omit<DatabaseTable, 'id'>) => {
    if (!tables.some(t => t.name === table.name)) {
      tables.push({ id: generateId('table'), ...table });
    }
  };

  // Always add users table if auth is required
  if (authRequired) {
    addTable({
      name: 'users', comment: 'Application users',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true },
        { name: 'password_hash', type: 'VARCHAR', length: 255, nullable: false },
        { name: 'full_name', type: 'VARCHAR', length: 100, nullable: false },
        { name: 'role', type: 'ENUM', nullable: false, enumValues: users, defaultValue: `'${users[0]}'` },
        { name: 'phone', type: 'VARCHAR', length: 20, nullable: true },
        { name: 'avatar_url', type: 'VARCHAR', length: 500, nullable: true },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE' },
        { name: 'email_verified', type: 'BOOLEAN', nullable: false, defaultValue: 'FALSE' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
      indexes: [{ name: 'idx_users_email', fields: ['email'], unique: true }],
    });
  }

  // Feature-specific tables
  const featureTableMap: Record<string, Omit<DatabaseTable, 'id'>[]> = {
    appointments: [{
      name: 'appointments', comment: 'Appointment bookings',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'patient_id', type: 'BIGINT', nullable: false },
        { name: 'doctor_id', type: 'BIGINT', nullable: false },
        { name: 'appointment_date', type: 'DATETIME', nullable: false },
        { name: 'duration_minutes', type: 'INTEGER', nullable: false, defaultValue: '30' },
        { name: 'status', type: 'ENUM', nullable: false, enumValues: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], defaultValue: "'PENDING'" },
        { name: 'notes', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
      foreignKeys: [
        { field: 'patient_id', referencesTable: 'users', referencesField: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
        { field: 'doctor_id', referencesTable: 'users', referencesField: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      ],
    }],

    prescriptions: [{
      name: 'prescriptions', comment: 'Medical prescriptions',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'patient_id', type: 'BIGINT', nullable: false },
        { name: 'doctor_id', type: 'BIGINT', nullable: false },
        { name: 'diagnosis', type: 'TEXT', nullable: true },
        { name: 'medicines', type: 'JSON', nullable: false },
        { name: 'instructions', type: 'TEXT', nullable: true },
        { name: 'issued_date', type: 'DATE', nullable: false },
        { name: 'valid_until', type: 'DATE', nullable: true },
      ],
    }],

    catalog: [{
      name: 'products', comment: 'Product catalog',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
        { name: 'description', type: 'TEXT', nullable: true },
        { name: 'price', type: 'DECIMAL', nullable: false },
        { name: 'sale_price', type: 'DECIMAL', nullable: true },
        { name: 'stock_quantity', type: 'INTEGER', nullable: false, defaultValue: '0' },
        { name: 'category_id', type: 'BIGINT', nullable: true },
        { name: 'image_urls', type: 'JSON', nullable: true },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
      indexes: [{ name: 'idx_products_category', fields: ['category_id'] }],
    }, {
      name: 'categories', comment: 'Product categories',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR', length: 100, nullable: false },
        { name: 'parent_id', type: 'BIGINT', nullable: true },
        { name: 'icon', type: 'VARCHAR', length: 50, nullable: true },
      ],
    }],

    cart: [{
      name: 'orders', comment: 'Customer orders',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'BIGINT', nullable: false },
        { name: 'status', type: 'ENUM', nullable: false, enumValues: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], defaultValue: "'PENDING'" },
        { name: 'total_amount', type: 'DECIMAL', nullable: false },
        { name: 'discount_amount', type: 'DECIMAL', nullable: true, defaultValue: '0.00' },
        { name: 'delivery_address', type: 'JSON', nullable: false },
        { name: 'payment_method', type: 'VARCHAR', length: 50, nullable: true },
        { name: 'payment_status', type: 'ENUM', nullable: false, enumValues: ['PENDING', 'PAID', 'REFUNDED'], defaultValue: "'PENDING'" },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    }, {
      name: 'order_items', comment: 'Items within orders',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'order_id', type: 'BIGINT', nullable: false },
        { name: 'product_id', type: 'BIGINT', nullable: false },
        { name: 'quantity', type: 'INTEGER', nullable: false },
        { name: 'unit_price', type: 'DECIMAL', nullable: false },
      ],
    }],

    text_chat: [{
      name: 'conversations', comment: 'Chat conversations',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'type', type: 'ENUM', nullable: false, enumValues: ['DIRECT', 'GROUP'] },
        { name: 'name', type: 'VARCHAR', length: 100, nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    }, {
      name: 'messages', comment: 'Chat messages',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'conversation_id', type: 'BIGINT', nullable: false },
        { name: 'sender_id', type: 'BIGINT', nullable: false },
        { name: 'content', type: 'TEXT', nullable: false },
        { name: 'message_type', type: 'ENUM', nullable: false, enumValues: ['TEXT', 'IMAGE', 'FILE', 'AUDIO'] },
        { name: 'is_read', type: 'BOOLEAN', nullable: false, defaultValue: 'FALSE' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
      indexes: [{ name: 'idx_messages_conversation', fields: ['conversation_id'] }],
    }],

    analytics: [{
      name: 'activity_logs', comment: 'User activity and analytics',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'BIGINT', nullable: true },
        { name: 'action', type: 'VARCHAR', length: 100, nullable: false },
        { name: 'resource', type: 'VARCHAR', length: 100, nullable: true },
        { name: 'metadata', type: 'JSON', nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    }],

    notifications: [{
      name: 'notifications', comment: 'Push and in-app notifications',
      fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'BIGINT', nullable: false },
        { name: 'title', type: 'VARCHAR', length: 200, nullable: false },
        { name: 'body', type: 'TEXT', nullable: false },
        { name: 'type', type: 'VARCHAR', length: 50, nullable: false },
        { name: 'is_read', type: 'BOOLEAN', nullable: false, defaultValue: 'FALSE' },
        { name: 'data', type: 'JSON', nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    }],
  };

  features.forEach(feature => {
    const tableDefs = featureTableMap[feature];
    if (tableDefs) {
      tableDefs.forEach(t => addTable(t));
    } else {
      // Dynamic table generation for custom features!
      const tableName = feature.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (tableName && tableName !== 'notifications' && tableName !== 'profiles' && tableName !== 'gps_tracking' && tableName !== 'payments') {
        addTable({
          name: tableName,
          comment: `Table for custom feature: ${feature}`,
          fields: [
            { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
            { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
            { name: 'status', type: 'VARCHAR', length: 50, nullable: true },
            { name: 'description', type: 'TEXT', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
          ]
        });
      }
    }
  });

  // Always add notifications if they're required
  if (features.includes('notifications') || features.includes('notificationsRequired')) {
    const notifTables = featureTableMap['notifications'];
    if (notifTables) notifTables.forEach(t => addTable(t));
  }

  return tables;
}
