'use strict';

exports.up = function (pgm) {
  // Seed delivery charges for Tamil Nadu
  pgm.sql(`
    DO $$
    DECLARE
      tn_id uuid;
      kl_id uuid;
      ka_id uuid;
    BEGIN
      -- Get State IDs
      SELECT id INTO tn_id FROM states WHERE name = 'Tamil Nadu' LIMIT 1;
      SELECT id INTO kl_id FROM states WHERE name = 'Kerala' LIMIT 1;
      SELECT id INTO ka_id FROM states WHERE name = 'Karnataka' LIMIT 1;

      -- Insert for Tamil Nadu
      IF tn_id IS NOT NULL THEN
        INSERT INTO delivery_charges (state_id, attribute_value, amount) VALUES
        (tn_id, '250g', 30.00),
        (tn_id, '500g', 40.00),
        (tn_id, '1kg', 60.00)
        ON CONFLICT (state_id, attribute_value) DO NOTHING;
      END IF;

      -- Insert for Kerala
      IF kl_id IS NOT NULL THEN
        INSERT INTO delivery_charges (state_id, attribute_value, amount) VALUES
        (kl_id, '250g', 40.00),
        (kl_id, '500g', 60.00),
        (kl_id, '1kg', 80.00)
        ON CONFLICT (state_id, attribute_value) DO NOTHING;
      END IF;

      -- Insert for Karnataka
      IF ka_id IS NOT NULL THEN
        INSERT INTO delivery_charges (state_id, attribute_value, amount) VALUES
        (ka_id, '250g', 40.00),
        (ka_id, '500g', 60.00),
        (ka_id, '1kg', 80.00)
        ON CONFLICT (state_id, attribute_value) DO NOTHING;
      END IF;
    END $$;
  `);
};

exports.down = function (pgm) {
  pgm.sql('DELETE FROM delivery_charges');
};
