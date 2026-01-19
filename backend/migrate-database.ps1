# Database Migration Script: thandattifoods -> pattikadai
# PowerShell version for Windows

param(
    [string]$DBHost = "159.89.163.255",
    [string]$DBPort = "5432",
    [string]$DBUser = "dbadmin",
    [string]$DBPassword = "Admin@123",
    [string]$OldDBName = "thandattifoods",
    [string]$NewDBName = "pattikadai"
)

# Configuration
$BackupDir = "./database-backups"
$BackupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Function to write colored output
function Write-ColorOutput {
    param([string]$Message, [string]$Color)
    Write-Host $Message -ForegroundColor $Color
}

# Header
Write-ColorOutput "========================================" $Cyan
Write-ColorOutput "Database Migration Script" $Cyan
Write-ColorOutput "$OldDBName → $NewDBName" $Cyan
Write-ColorOutput "========================================" $Cyan
Write-Host ""

# Step 1: Verify PostgreSQL connection
Write-ColorOutput "Step 1: Verifying PostgreSQL connection..." $Yellow
$env:PGPASSWORD = $DBPassword
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ PostgreSQL connection successful" $Green
    }
    else {
        throw "Connection failed"
    }
}
catch {
    Write-ColorOutput "✗ Failed to connect to PostgreSQL" $Red
    Write-Host "  Host: $DBHost"
    Write-Host "  Port: $DBPort"
    Write-Host "  User: $DBUser"
    Write-Host "  Error: $_"
    exit 1
}
Write-Host ""

# Step 2: Check if old database exists
Write-ColorOutput "Step 2: Checking if database '$OldDBName' exists..." $Yellow
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$OldDBName'" 2>&1
    if ($result -like "*1*") {
        Write-ColorOutput "✓ Database '$OldDBName' found" $Green
    }
    else {
        throw "Database not found"
    }
}
catch {
    Write-ColorOutput "✗ Database '$OldDBName' not found" $Red
    exit 1
}
Write-Host ""

# Step 3: Create backup
Write-ColorOutput "Step 3: Creating backup..." $Yellow
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}
$BackupFile = "$BackupDir/${OldDBName}_backup_${BackupTimestamp}.sql"
Write-Host "  Dumping database to: $BackupFile"

try {
    & pg_dump -h $DBHost -p $DBPort -U $DBUser $OldDBName | Out-File -FilePath $BackupFile -Encoding UTF8
    if ($LASTEXITCODE -eq 0) {
        $BackupSize = (Get-Item $BackupFile).Length / 1MB
        Write-ColorOutput "✓ Backup created successfully" $Green
        Write-Host "  Size: $([math]::Round($BackupSize, 2)) MB"
    }
    else {
        throw "Backup command failed"
    }
}
catch {
    Write-ColorOutput "✗ Backup failed: $_" $Red
    exit 1
}
Write-Host ""

# Step 4: Check if new database exists
Write-ColorOutput "Step 4: Checking if database '$NewDBName' exists..." $Yellow
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$NewDBName'" 2>&1
    if ($result -like "*1*") {
        Write-ColorOutput "⚠ Database '$NewDBName' already exists" $Yellow
        $DropResponse = Read-Host "Do you want to drop it? (yes/no)"
        if ($DropResponse -eq "yes") {
            Write-ColorOutput "Dropping database '$NewDBName'..." $Yellow
            $dropResult = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "DROP DATABASE $NewDBName;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Database dropped" $Green
            }
            else {
                Write-ColorOutput "✗ Failed to drop database" $Red
                exit 1
            }
        }
        else {
            Write-ColorOutput "Aborting migration" $Red
            exit 1
        }
    }
    else {
        Write-ColorOutput "✓ Database '$NewDBName' is available" $Green
    }
}
catch {
    Write-ColorOutput "⚠ Could not check new database: $_" $Yellow
}
Write-Host ""

# Step 5: Rename database
Write-ColorOutput "Step 5: Migrating database..." $Yellow
Write-Host "  Method: Rename existing database"
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "ALTER DATABASE $OldDBName RENAME TO $NewDBName;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Database renamed successfully" $Green
    }
    else {
        throw $result
    }
}
catch {
    Write-ColorOutput "✗ Rename failed: $_" $Red
    Write-Host "  Attempting alternative method: Create from backup"
    
    try {
        & createdb -h $DBHost -p $DBPort -U $DBUser $NewDBName 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ New database created" $Green
            
            Get-Content $BackupFile | & psql -h $DBHost -p $DBPort -U $DBUser -d $NewDBName 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Backup restored successfully" $Green
            }
            else {
                Write-ColorOutput "✗ Failed to restore backup" $Red
                exit 1
            }
        }
        else {
            throw "Failed to create new database"
        }
    }
    catch {
        Write-ColorOutput "✗ Alternative method failed: $_" $Red
        exit 1
    }
}
Write-Host ""

# Step 6: Verify migration
Write-ColorOutput "Step 6: Verifying migration..." $Yellow
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$NewDBName'" 2>&1
    if ($result -like "*1*") {
        Write-ColorOutput "✓ New database '$NewDBName' verified" $Green
    }
    else {
        throw "Database not found"
    }
}
catch {
    Write-ColorOutput "✗ Database verification failed: $_" $Red
    exit 1
}

# Count tables
$TableCount = & psql -h $DBHost -p $DBPort -U $DBUser -d $NewDBName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
Write-Host "  Tables in new database: $TableCount"
Write-Host ""

# Step 7: Check old database status
Write-ColorOutput "Step 7: Checking old database status..." $Yellow
try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$OldDBName'" 2>&1
    if ($result -like "*1*") {
        Write-ColorOutput "⚠ Old database '$OldDBName' still exists" $Yellow
        $CleanupResponse = Read-Host "Do you want to drop the old database? (yes/no)"
        if ($CleanupResponse -eq "yes") {
            $dropResult = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "DROP DATABASE $OldDBName;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Old database dropped" $Green
            }
            else {
                Write-ColorOutput "✗ Failed to drop old database: $dropResult" $Red
            }
        }
        else {
            Write-ColorOutput "⚠ Old database kept for safety" $Yellow
        }
    }
    else {
        Write-ColorOutput "✓ Old database no longer exists" $Green
    }
}
catch {
    Write-ColorOutput "⚠ Could not check old database: $_" $Yellow
}
Write-Host ""

# Step 8: Update .env file
Write-ColorOutput "Step 8: Updating .env file..." $Yellow
$EnvFile = ".\.env"
if (Test-Path $EnvFile) {
    try {
        $content = Get-Content $EnvFile -Raw
        $content = $content -replace "DB_NAME=$OldDBName", "DB_NAME=$NewDBName"
        Set-Content -Path $EnvFile -Value $content -Encoding UTF8
        Write-ColorOutput "✓ .env file updated" $Green
        Write-Host "  Updated value: DB_NAME=$NewDBName"
    }
    catch {
        Write-ColorOutput "✗ Failed to update .env: $_" $Red
    }
}
else {
    Write-ColorOutput "⚠ .env file not found" $Yellow
}
Write-Host ""

# Final Summary
Write-ColorOutput "========================================" $Cyan
Write-ColorOutput "✓ Database migration completed successfully!" $Green
Write-ColorOutput "========================================" $Cyan
Write-Host ""
Write-ColorOutput "Summary:" $Yellow
Write-Host "  Old Database: $OldDBName (check if exists)"
Write-Host "  New Database: $NewDBName (active)"
Write-Host "  Backup Location: $BackupFile"
Write-Host "  Tables Migrated: $TableCount"
Write-Host ""
Write-ColorOutput "Next Steps:" $Yellow
Write-Host "  1. Update backend\.env with new database name if not auto-updated"
Write-Host "  2. Restart backend service: pm2 restart all"
Write-Host "  3. Verify connection: node test-db-connection.js"
Write-Host "  4. Test application endpoints"
Write-Host ""

# Clear password from environment
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
