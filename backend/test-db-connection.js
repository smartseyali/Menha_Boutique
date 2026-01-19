require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

console.log("Testing database connection...");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("Database:", process.env.DB_NAME);
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("\nPlease check:");
    console.error("1. Database password is correct in backend/.env");
    console.error("2. Remote database server is accessible from your machine");
    console.error("3. Firewall allows connections on port 5432");
    console.error('4. Database name is exactly "pattikadai"');
    process.exit(1);
  } else {
    console.log("✅ Database connected successfully!");
    console.log("Server time:", res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});
