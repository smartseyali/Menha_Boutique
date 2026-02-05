exports.up = (pgm) => {
  pgm.createTable('payment_gateways', {
    id: 'id',
    name: { type: 'varchar(50)', notNull: true }, // razorpay, phonepe, etc.
    type: { type: 'varchar(50)', notNull: true, default: 'payment_gateway' },
    is_active: { type: 'boolean', default: false },
    is_test_mode: { type: 'boolean', default: true },
    credentials: { type: 'jsonb', notNull: true }, // Storing keys/secrets as JSON
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  
  // Ensure we can only have unique names if wanted, but main requirement is "activate one".
  // pgm.createIndex('payment_gateways', 'name', { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('payment_gateways');
};
