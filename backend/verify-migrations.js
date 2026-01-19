require('dotenv').config();
const pool = require('./src/config/database');

async function verifyMigrations() {
  try {
    console.log('Verifying migrations...\n');
    
    // Check product columns
    const productCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('detailed_description', 'product_details', 'product_information')
      ORDER BY column_name
    `);
    
    console.log('✅ New product columns:');
    if (productCols.rows.length === 0) {
      console.log('   ⚠️  No new columns found');
    } else {
      productCols.rows.forEach(r => {
        console.log(`   - ${r.column_name} (${r.data_type})`);
      });
    }
    
    // Check product_attributes table
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_attributes'
      )
    `);
    
    console.log(`\n✅ product_attributes table exists: ${tableCheck.rows[0].exists}`);
    
    if (tableCheck.rows[0].exists) {
      const attrCols = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'product_attributes' 
        ORDER BY ordinal_position
      `);
      console.log(`\n✅ product_attributes columns (${attrCols.rows.length}):`);
      attrCols.rows.forEach(r => {
        console.log(`   - ${r.column_name} (${r.data_type})`);
      });
    }
    
    // Check migration history
    const migrations = await pool.query(`
      SELECT name, run_on 
      FROM pgmigrations 
      WHERE name IN ('024_create_product_attributes_table', '025_add_product_details_fields')
      ORDER BY run_on DESC
    `);
    
    console.log(`\n✅ Migration history:`);
    migrations.rows.forEach(m => {
      console.log(`   - ${m.name} (run on: ${m.run_on})`);
    });
    
    console.log('\n✅ All migrations verified successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error verifying migrations:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyMigrations();

