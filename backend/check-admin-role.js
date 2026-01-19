require('dotenv').config();
const { Pool } = require('pg');
const config = require('./src/config/config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function checkAndUpdateAdminRole(phoneNumber) {
  try {
    // Find user by phone number
    const result = await pool.query(
      'SELECT id, email, phone_number, first_name, last_name, role FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      console.log(`❌ User with phone number ${phoneNumber} not found`);
      return;
    }

    const user = result.rows[0];
    console.log('\n📋 Current User Info:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Phone:', user.phone_number);
    console.log('  Name:', `${user.first_name} ${user.last_name}`);
    console.log('  Current Role:', user.role || '(NULL)');

    if (user.role !== 'admin') {
      console.log('\n⚠️  User does not have admin role');
      console.log('Updating role to "admin"...');
      
      await pool.query(
        'UPDATE users SET role = $1, updated_at = current_timestamp WHERE id = $2',
        ['admin', user.id]
      );
      
      console.log('✅ User role updated to "admin"');
      console.log('\n💡 Please log out and log back in for the changes to take effect.');
    } else {
      console.log('\n✅ User already has admin role');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('Usage: node check-admin-role.js <phone_number>');
  console.log('Example: node check-admin-role.js 1234567890');
  process.exit(1);
}

checkAndUpdateAdminRole(phoneNumber);

