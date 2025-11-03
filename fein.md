# 5. FILE SYSTEM SETUP

## Step 1: Find Your Username

**Windows:**

```cmd
echo %USERNAME%
```

Output: Your office username (e.g., `john.doe` or `2033304`)

## Step 2: Create Folders

Open Command Prompt as Administrator:

```cmd
# Create Source folder
mkdir C:\Users\YOUR_USERNAME\Source

# Create Destination base
mkdir C:\Users\YOUR_USERNAME\Destination
```

## Step 3: Create Test Files

### File 1: Customer_2023052701010_1.csv

**Location:** `C:\Users\YOUR_USERNAME\Source\Customer_2023052701010_1.csv`

**Content:**
```csv
customer_id,name,email,phone,city,country
1001,John Doe,john.doe@example.com,+65-98765432,Singapore,SG
1002,Jane Smith,jane.smith@example.com,+65-87654321,Singapore,SG
1003,Bob Johnson,bob.johnson@example.com,+65-76543210,Singapore,SG
```

### File 2: Invoice_2024011234567_2.pdf

**Location:** `C:\Users\YOUR_USERNAME\Source\Invoice_2024011234567_2.pdf`

Create a text file and rename to .pdf:

```
INVOICE
Invoice No: 2024011234567
Date: 2024-01-12
Customer: ABC Corporation
Amount: $10,000.00
```

### File 3: Report_XYZ_3.csv

**Location:** `C:\Users\YOUR_USERNAME\Source\Report_XYZ_3.csv`

**Content:**
```csv
report_id,department,metric,value,period
R001,Operations,Efficiency,95.5,Q1-2024
R002,Operations,Productivity,87.2,Q1-2024
R003,Operations,Quality,92.8,Q1-2024
```

### File 4: Document_ABC_4.txt

**Location:** `C:\Users\YOUR_USERNAME\Source\Document_ABC_4.txt`

**Content:**
```
Document Archive - ABC-4
Title: Quarterly Business Review
Date: 2024-01-15
Department: HR
Status: Approved
```

### File 5: File_DEF_5.pdf

**Location:** `C:\Users\YOUR_USERNAME\Source\File_DEF_5.pdf`

Create a text file and rename to .pdf:

```
PUBLIC FILE - DEF-5
Category: Public Documents
Classification: General
Date: 2024-01-20
```

## Step 4: Verify File Structure

```
C:\Users\YOUR_USERNAME\
├── Source\
│   ├── Customer_2023052701010_1.csv  ✓
│   ├── Invoice_2024011234567_2.pdf   ✓
│   ├── Report_XYZ_3.csv              ✓
│   ├── Document_ABC_4.txt            ✓
│   └── File_DEF_5.pdf                ✓
│
└── Destination\
    (empty - folders will be created automatically)
```

---

# 6. TESTING GUIDE

## Step 1: Start Backend

```bash
# Navigate to backend directory
cd rwtool-backend

# Clean build
mvn clean install

# Run
mvn spring-boot:run

# Wait for:
# "Tomcat started on port(s): 8080 (http)"
# "Started RwtoolBackendApplication"
```

## Step 2: Test Backend Directly

Open browser:

```
http://localhost:8080/api/reports/pending
```

Should return JSON array with 5 pending reports:

```json
[
  {
    "id": 1,
    "name": "Customer_2023052701010_1.csv",
    "date": "2023-05-27",
    "status": "pending",
    "fileName": "Customer_2023052701010_1.csv",
    "outputPath": "SG/Retail/Customer"
  },
  ...
]
```

✅ If you see JSON → Backend working!

❌ If error 404/500 → Check backend logs

## Step 3: Start Frontend

```bash
# Navigate to frontend directory
cd rwtool-frontend

# Install dependencies (if first time)
npm install

# Start
npm start

# Browser opens at http://localhost:3000
```

## Step 4: Login

Use operations credentials:

```
Email: operations@sc.com
Password: 123
```

## Step 5: Verify Operations Page

Navigate to: `http://localhost:3000/OpsPage/OpsPage`

Should see:

✅ **Stats Cards:**
- Total Reports: 5
- Synced Reports: 0
- Pending Reports: 5

✅ **Reports to be Synced Table:**
- 5 rows showing pending files

✅ **Transfer Logs:**
- Empty (no transfers yet)

## Step 6: Test Single File Transfer

1. Click **[Sync]** on first file
2. Wait 1-2 seconds
3. Should see success message
4. Stats update:
   - Pending: 4
   - Synced: 1
5. File disappears from pending table
6. Check destination:
   ```
   C:\Users\YOUR_USERNAME\Destination\SG\Retail\Customer\
   └── Customer_2023052701010_1.csv  ← File here!
   ```
7. Transfer log appears in table

## Step 7: Test Sync All

1. Click **[Sync All]** button
2. Wait 3-5 seconds
3. All pending files transfer
4. Stats update:
   - Pending: 0
   - Synced: 5
5. All files appear in respective destination folders

## Step 8: Verify All Destinations

Check these paths exist:

```
C:\Users\YOUR_USERNAME\Destination\
├── SG\
│   ├── Retail\
│   │   └── Customer\
│   │       └── Customer_2023052701010_1.csv  ✓
│   ├── Finance\
│   │   └── Invoice\
│   │       └── Invoice_2024011234567_2.pdf   ✓
│   └── Files\
│       └── Public\
│           └── File_DEF_5.pdf                ✓
├── UK\
│   └── Operations\
│       └── Reports\
│           └── Report_XYZ_3.csv              ✓
└── US\
    └── Documents\
        └── Archive\
            └── Document_ABC_4.txt            ✓
```

## Step 9: Verify Database

Open pgAdmin and run:

```sql
-- Check reports status (should all be 'synced')
SELECT id, name, status, file_path FROM reports ORDER BY id;

-- Check transfer logs (should have 5 entries)
SELECT 
    tl.id,
    pc.input_file_name,
    tl.status,
    tl.folder,
    tl.transferred_at
FROM transfer_logs tl
JOIN path_configs pc ON tl.path_config_id = pc.id
ORDER BY tl.transferred_at DESC;
```

# 2. DATABASE SETUP

## Step 1: Connect to Your Office Database

**Open pgAdmin or psql and connect to your existing database.**

⚠️ **IMPORTANT:** Don't create new database! Use existing one with users/roles tables!

## Step 2: Create ONLY Operations Module Tables

Run this SQL script:

```sql
-- =============================================
-- OPERATIONS MODULE TABLES
-- (Don't touch existing users, roles, groups tables!)
-- =============================================

-- 1. Path Configs Table (API Requests from Admin Module)
CREATE TABLE IF NOT EXISTS path_configs (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(255) UNIQUE,
    action VARCHAR(50),
    input_file_name VARCHAR(500),
    file_type VARCHAR(50),
    output_folder_path VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Reports Table (Global - for User Downloads)
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_path VARCHAR(1000),
    path_config_id INTEGER REFERENCES path_configs(id) UNIQUE,
    group_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Transfer Logs Table (Operations Audit Trail)
CREATE TABLE IF NOT EXISTS transfer_logs (
    id SERIAL PRIMARY KEY,
    path_config_id INTEGER REFERENCES path_configs(id),
    user_id INTEGER,
    status VARCHAR(50) NOT NULL,
    folder VARCHAR(500),
    error_message TEXT,
    transferred_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INSERT SAMPLE DATA (for testing)
-- =============================================

-- Clear existing test data
TRUNCATE TABLE transfer_logs CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE path_configs CASCADE;

-- Insert sample path_configs (as if from Admin API)
INSERT INTO path_configs (unique_id, action, input_file_name, file_type, output_folder_path, created_at, updated_at) 
VALUES 
('REQ-001-ABC', 'New', 'Customer_2023052701010_1.csv', 'csv', 'SG/Retail/Customer', NOW(), NOW()),
('REQ-002-DEF', 'New', 'Invoice_2024011234567_2.pdf', 'pdf', 'SG/Finance/Invoice', NOW(), NOW()),
('REQ-003-GHI', 'New', 'Report_XYZ_3.csv', 'csv', 'UK/Operations/Reports', NOW(), NOW()),
('REQ-004-JKL', 'New', 'Document_ABC_4.txt', 'txt', 'US/Documents/Archive', NOW(), NOW()),
('REQ-005-MNO', 'New', 'File_DEF_5.pdf', 'pdf', 'SG/Files/Public', NOW(), NOW());

-- Insert corresponding reports (status='pending')
INSERT INTO reports (name, status, path_config_id, created_at, updated_at)
VALUES 
('Customer_2023052701010_1.csv', 'pending', 1, NOW(), NOW()),
('Invoice_2024011234567_2.pdf', 'pending', 2, NOW(), NOW()),
('Report_XYZ_3.csv', 'pending', 3, NOW(), NOW()),
('Document_ABC_4.txt', 'pending', 4, NOW(), NOW()),
('File_DEF_5.pdf', 'pending', 5, NOW(), NOW());

-- =============================================
-- VERIFY DATA
-- =============================================

SELECT 'path_configs' as table_name, COUNT(*) as count FROM path_configs
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'transfer_logs', COUNT(*) FROM transfer_logs;

-- Should show:
-- path_configs: 5
-- reports: 5
-- transfer_logs: 0

-- Verify pending reports
SELECT id, name, status, path_config_id FROM reports WHERE status = 'pending';


## File 2: application.properties

**Location:** `src/main/resources/application.properties`

⚠️ **IMPORTANT:** Update these values for YOUR office laptop!

```properties
# Server Configuration
server.port=8080

# Database Configuration
# ⚠️ UPDATE THESE WITH YOUR OFFICE DATABASE CREDENTIALS!
spring.datasource.url=jdbc:postgresql://localhost:5432/YOUR_DATABASE_NAME
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# File Transfer Configuration
# ⚠️ REPLACE YOUR_OFFICE_USERNAME WITH YOUR ACTUAL USERNAME!
file.transfer.source.base=C:/Users/YOUR_OFFICE_USERNAME/Source
file.transfer.destination.base=C:/Users/YOUR_OFFICE_USERNAME/Destination

# CORS Configuration
cors.allowed.origins=http://localhost:3000

# Logging
logging.level.com.scgbs.rwtool=INFO