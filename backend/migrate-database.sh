#!/bin/bash

# Database Migration Script: thandattifoods -> pattikadai
# This script migrates the database with proper backup and verification

set -e

# Configuration
DB_HOST=${DB_HOST:-159.89.163.255}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-dbadmin}
DB_PASSWORD=${DB_PASSWORD:-Admin@123}
OLD_DB_NAME="thandattifoods"
NEW_DB_NAME="pattikadai"
BACKUP_DIR="./database-backups"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Migration Script${NC}"
echo -e "${BLUE}${OLD_DB_NAME} → ${NEW_DB_NAME}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Verify PostgreSQL connection
echo -e "${YELLOW}Step 1: Verifying PostgreSQL connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
else
    echo -e "${RED}✗ Failed to connect to PostgreSQL${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    exit 1
fi
echo ""

# Step 2: Check if old database exists
echo -e "${YELLOW}Step 2: Checking if database '${OLD_DB_NAME}' exists...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='${OLD_DB_NAME}'" | grep -q 1; then
    echo -e "${GREEN}✓ Database '${OLD_DB_NAME}' found${NC}"
else
    echo -e "${RED}✗ Database '${OLD_DB_NAME}' not found${NC}"
    exit 1
fi
echo ""

# Step 3: Create backup directory
echo -e "${YELLOW}Step 3: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/${OLD_DB_NAME}_backup_${BACKUP_TIMESTAMP}.sql"

echo "  Dumping database to: ${BACKUP_FILE}"
if PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $OLD_DB_NAME > "$BACKUP_FILE"; then
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi
echo ""

# Step 4: Check if new database already exists
echo -e "${YELLOW}Step 4: Checking if database '${NEW_DB_NAME}' already exists...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='${NEW_DB_NAME}'" | grep -q 1; then
    echo -e "${YELLOW}⚠ Database '${NEW_DB_NAME}' already exists${NC}"
    read -p "Do you want to drop it and create a new one? (yes/no): " -r
    echo ""
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${YELLOW}Dropping database '${NEW_DB_NAME}'...${NC}"
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE ${NEW_DB_NAME};"; then
            echo -e "${GREEN}✓ Database dropped${NC}"
        else
            echo -e "${RED}✗ Failed to drop database${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Aborting migration${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Database '${NEW_DB_NAME}' is available${NC}"
fi
echo ""

# Step 5: Rename database (or create from backup if rename is not possible)
echo -e "${YELLOW}Step 5: Migrating database...${NC}"
echo "  Method: Rename existing database"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "ALTER DATABASE ${OLD_DB_NAME} RENAME TO ${NEW_DB_NAME};"; then
    echo -e "${GREEN}✓ Database renamed successfully${NC}"
else
    echo -e "${RED}✗ Rename failed${NC}"
    echo "  Attempting alternative method: Create from backup"
    
    if PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $NEW_DB_NAME; then
        echo -e "${GREEN}✓ New database created${NC}"
        
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER $NEW_DB_NAME < "$BACKUP_FILE"; then
            echo -e "${GREEN}✓ Backup restored successfully${NC}"
        else
            echo -e "${RED}✗ Failed to restore backup${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Failed to create new database${NC}"
        exit 1
    fi
fi
echo ""

# Step 6: Verify migration
echo -e "${YELLOW}Step 6: Verifying migration...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='${NEW_DB_NAME}'" | grep -q 1; then
    echo -e "${GREEN}✓ New database '${NEW_DB_NAME}' verified${NC}"
else
    echo -e "${RED}✗ Database verification failed${NC}"
    exit 1
fi

# Check table count
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $NEW_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in new database: $TABLE_COUNT"
echo ""

# Step 7: Check if old database exists and cleanup if needed
echo -e "${YELLOW}Step 7: Checking old database status...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='${OLD_DB_NAME}'" | grep -q 1; then
    echo -e "${YELLOW}⚠ Old database '${OLD_DB_NAME}' still exists${NC}"
    read -p "Do you want to drop the old database? (yes/no): " -r
    echo ""
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE ${OLD_DB_NAME};"; then
            echo -e "${GREEN}✓ Old database dropped${NC}"
        else
            echo -e "${RED}✗ Failed to drop old database${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Old database kept for safety${NC}"
    fi
else
    echo -e "${GREEN}✓ Old database no longer exists${NC}"
fi
echo ""

# Step 8: Update .env file
echo -e "${YELLOW}Step 8: Updating .env file...${NC}"
if [ -f ".env" ]; then
    sed -i "s/DB_NAME=${OLD_DB_NAME}/DB_NAME=${NEW_DB_NAME}/" .env
    echo -e "${GREEN}✓ .env file updated${NC}"
    echo "  Updated value: DB_NAME=${NEW_DB_NAME}"
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
fi
echo ""

# Final Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Database migration completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  Old Database: ${OLD_DB_NAME} (check if exists)"
echo "  New Database: ${NEW_DB_NAME} (active)"
echo "  Backup Location: ${BACKUP_FILE}"
echo "  Tables Migrated: ${TABLE_COUNT}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update backend/.env with new database name if not auto-updated"
echo "  2. Restart backend service: pm2 restart all"
echo "  3. Verify connection: node test-db-connection.js"
echo "  4. Test application endpoints"
echo ""
