require("dotenv").config();
const { Client } = require("pg");

// Connect to default postgres database to create the target database
const adminClient = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "postgres", // Connect to default database
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const dbName = process.env.DB_NAME || "pattikadai";

console.log("Creating database:", dbName);
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);

adminClient
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL server");

    // Check if database exists
    return adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [
      dbName,
    ]);
  })
  .then((result) => {
    if (result.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists`);
      return adminClient.end();
    } else {
      // Create database
      console.log(`Creating database "${dbName}"...`);
      return adminClient.query(`CREATE DATABASE "${dbName}"`).then(() => {
        console.log(`✅ Database "${dbName}" created successfully`);
        return adminClient.end();
      });
    }
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    if (adminClient) {
      adminClient.end();
    }
    process.exit(1);
  });
