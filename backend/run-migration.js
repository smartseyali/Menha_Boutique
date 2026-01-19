require('dotenv').config();
const path = require('path');

// Debug: Check if environment variables are loaded
console.log('Database Config:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// Create DATABASE_URL for node-pg-migrate
const databaseUrl = `postgres://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true&sslmode=no-verify`;

const { execSync } = require('child_process');

const command = process.argv.slice(2).join(' ');
const migrationsDir = path.join(__dirname, 'src', 'migrations');
const migrationCommand = `npx node-pg-migrate ${command} --migrations-dir "${migrationsDir}" --database-url "${databaseUrl}"`;

// Ensure all environment variables are passed
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
};

try {
  execSync(migrationCommand, { 
    stdio: 'inherit', 
    env: env,
    shell: true,
    cwd: __dirname
  });
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

