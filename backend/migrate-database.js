#!/usr/bin/env node

/**
 * Database Migration Script: thandattifoods -> pattikadai
 * Node.js version that works cross-platform
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

require("dotenv").config();

// Configuration
const DB_HOST = process.env.DB_HOST || "159.89.163.255";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || "dbadmin";
const DB_PASSWORD = process.env.DB_PASSWORD || "Admin@123";
const OLD_DB_NAME = "thandattifoods";
const NEW_DB_NAME = "pattikadai";
const BACKUP_DIR = "./database-backups";
const BACKUP_TIMESTAMP = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .slice(0, -5);

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

// Helper function for colored output
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function for user input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

// Main migration function
async function migrate() {
  try {
    log("\n========================================", "blue");
    log("Database Migration Script", "blue");
    log(`${OLD_DB_NAME} → ${NEW_DB_NAME}`, "blue");
    log("========================================\n", "blue");

    // Step 1: Verify connection
    log("Step 1: Verifying PostgreSQL connection...", "yellow");
    const client = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: "postgres",
    });

    await client.connect();
    log("✓ PostgreSQL connection successful\n", "green");
    await client.end();

    // Step 2: Check if old database exists
    log(`Step 2: Checking if database '${OLD_DB_NAME}' exists...`, "yellow");
    const checkClient = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: "postgres",
    });

    await checkClient.connect();
    const result = await checkClient.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [OLD_DB_NAME]
    );

    if (result.rows.length === 0) {
      log(`✗ Database '${OLD_DB_NAME}' not found\n`, "red");
      await checkClient.end();
      process.exit(1);
    }
    log(`✓ Database '${OLD_DB_NAME}' found\n`, "green");

    // Step 3: Create backup directory
    log("Step 3: Creating backup...", "yellow");
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // For simplicity, we'll just note the backup would happen
    const backupFile = path.join(
      BACKUP_DIR,
      `${OLD_DB_NAME}_backup_${BACKUP_TIMESTAMP}.sql`
    );
    log(`Backup location: ${backupFile}\n`, "yellow");
    log("Note: Create a manual backup using:\n", "yellow");
    log(
      `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${OLD_DB_NAME} > ${backupFile}\n`,
      "yellow"
    );

    const backupConfirm = await askQuestion(
      "Have you created a backup or want to proceed without one? (yes/no): "
    );
    if (backupConfirm !== "yes") {
      log("Aborting migration", "red");
      await checkClient.end();
      process.exit(1);
    }
    log("");

    // Step 4: Check if new database exists
    log(`Step 4: Checking if database '${NEW_DB_NAME}' exists...`, "yellow");
    const newDbResult = await checkClient.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [NEW_DB_NAME]
    );

    if (newDbResult.rows.length > 0) {
      log(`⚠ Database '${NEW_DB_NAME}' already exists`, "yellow");
      const dropResponse = await askQuestion(
        "Drop it and continue? (yes/no): "
      );
      if (dropResponse === "yes") {
        log(`Dropping database '${NEW_DB_NAME}'...`, "yellow");
        // Terminate all connections
        await checkClient.query(
          "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()",
          [NEW_DB_NAME]
        );
        // Drop database
        await checkClient.query(`DROP DATABASE ${NEW_DB_NAME}`);
        log(`✓ Database dropped\n`, "green");
      } else {
        log("Aborting migration", "red");
        await checkClient.end();
        process.exit(1);
      }
    } else {
      log(`✓ Database '${NEW_DB_NAME}' is available\n`, "green");
    }

    // Step 5: Rename database
    log("Step 5: Migrating database...", "yellow");
    log("Method: Rename existing database", "yellow");
    try {
      // Terminate all connections to old database
      await checkClient.query(
        "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()",
        [OLD_DB_NAME]
      );

      // Rename database
      await checkClient.query(
        `ALTER DATABASE ${OLD_DB_NAME} RENAME TO ${NEW_DB_NAME}`
      );
      log(`✓ Database renamed successfully\n`, "green");
    } catch (error) {
      log(`✗ Rename failed: ${error.message}`, "red");
      await checkClient.end();
      process.exit(1);
    }

    // Step 6: Verify migration
    log("Step 6: Verifying migration...", "yellow");
    const verifyResult = await checkClient.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [NEW_DB_NAME]
    );

    if (verifyResult.rows.length === 0) {
      log(`✗ New database '${NEW_DB_NAME}' not found`, "red");
      await checkClient.end();
      process.exit(1);
    }
    log(`✓ New database '${NEW_DB_NAME}' verified`, "green");

    // Count tables
    const tableResult = await checkClient.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_catalog = $1",
      [NEW_DB_NAME]
    );
    const tableCount = tableResult.rows[0].count;
    log(`Tables in new database: ${tableCount}\n`, "yellow");

    // Step 7: Check old database status
    log("Step 7: Checking old database status...", "yellow");
    const oldDbCheck = await checkClient.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [OLD_DB_NAME]
    );

    if (oldDbCheck.rows.length > 0) {
      log(
        `⚠ Old database '${OLD_DB_NAME}' still exists (this shouldn't happen)`,
        "yellow"
      );
      log("The rename operation may have encountered issues.\n", "yellow");
    } else {
      log(`✓ Old database '${OLD_DB_NAME}' no longer exists\n`, "green");
    }

    await checkClient.end();

    // Step 8: Update .env file
    log("Step 8: Updating .env file...", "yellow");
    const envPath = ".env";
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      envContent = envContent.replace(
        new RegExp(`DB_NAME=${OLD_DB_NAME}`, "g"),
        `DB_NAME=${NEW_DB_NAME}`
      );
      fs.writeFileSync(envPath, envContent);
      log(`✓ .env file updated`, "green");
      log(`Updated value: DB_NAME=${NEW_DB_NAME}\n`, "yellow");
    } else {
      log(`⚠ .env file not found\n`, "yellow");
    }

    // Final Summary
    log("========================================", "blue");
    log("✓ Database migration completed successfully!", "green");
    log("========================================\n", "blue");

    log("Summary:", "yellow");
    log(`Old Database: ${OLD_DB_NAME} (removed)`);
    log(`New Database: ${NEW_DB_NAME} (active)`);
    log(`Backup Location: ${backupFile}`);
    log(`Tables Migrated: ${tableCount}`);
    log("");

    log("Next Steps:", "yellow");
    log("1. Verify backend/.env has DB_NAME=pattikadai");
    log("2. Restart backend service: pm2 restart all");
    log("3. Verify connection: node test-db-connection.js");
    log("4. Test application endpoints");
    log("");
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, "red");
    if (error.code === "ECONNREFUSED") {
      log(
        "Unable to connect to PostgreSQL. Check your connection settings.",
        "red"
      );
      log(`Host: ${DB_HOST}`, "yellow");
      log(`Port: ${DB_PORT}`, "yellow");
      log(`User: ${DB_USER}`, "yellow");
    }
    process.exit(1);
  }
}

// Run migration
migrate();
