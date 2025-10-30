# 🏢 COMPLETE OFFICE LAPTOP SETUP GUIDE - FROM SCRATCH

**Operations Module - RW Tool**  
**Version:** 1.0  
**Date:** October 30, 2025

---

# 📋 TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Database Setup](#2-database-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [File System Setup](#5-file-system-setup)
6. [Testing Guide](#6-testing-guide)
7. [Troubleshooting](#7-troubleshooting)
8. [Final Checklist](#8-final-checklist)

---

# 📦 COMPLETE FILE LIST

## Backend Files You Need to Create

### Configuration & Build Files
- ✅ `pom.xml` - Maven dependencies
- ✅ `src/main/resources/application.properties` - App configuration

### Main Application
- ✅ `src/main/java/com/scgbs/rwtool/RwtoolBackendApplication.java` - Main class

### Configuration Classes
- ✅ `src/main/java/com/scgbs/rwtool/config/WebConfig.java` - CORS configuration
- ✅ `src/main/java/com/scgbs/rwtool/config/SecurityConfig.java` - Security (optional)

### Entity Classes
- ✅ `src/main/java/com/scgbs/rwtool/entity/PathConfig.java`
- ✅ `src/main/java/com/scgbs/rwtool/entity/Report.java`
- ✅ `src/main/java/com/scgbs/rwtool/entity/TransferLog.java`

### Repository Interfaces
- ✅ `src/main/java/com/scgbs/rwtool/repository/PathConfigRepository.java`
- ✅ `src/main/java/com/scgbs/rwtool/repository/ReportRepository.java`
- ✅ `src/main/java/com/scgbs/rwtool/repository/TransferLogRepository.java`

### DTO Classes
- ✅ `src/main/java/com/scgbs/rwtool/dto/ReportDTO.java`
- ✅ `src/main/java/com/scgbs/rwtool/dto/TransferLogDTO.java`
- ✅ `src/main/java/com/scgbs/rwtool/dto/StatsDTO.java`
- ✅ `src/main/java/com/scgbs/rwtool/dto/SyncResponseDTO.java`

### Service Classes
- ✅ `src/main/java/com/scgbs/rwtool/service/FileTransferService.java`
- ✅ `src/main/java/com/scgbs/rwtool/service/OperationsService.java`

### Controller
- ✅ `src/main/java/com/scgbs/rwtool/controller/OperationsController.java`

**Total Backend Files: 16 files**

## Frontend Files You Need to Create/Update

- ✅ `src/services/opsService.js` - API service layer

**Total Frontend Files: 1 file** (OpsPage.jsx and others already exist!)

## Database Tables

- ✅ `path_configs` - File request metadata
- ✅ `reports` - Global status table
- ✅ `transfer_logs` - Audit trail

**Total Tables: 3 tables**

---

# 1. PREREQUISITES

## Software Required

- ✅ **Java 17+** - [Download](https://adoptium.net/)
- ✅ **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- ✅ **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Git** - [Download](https://git-scm.com/downloads)

## Verify Installation

```bash
# Check Java
java -version

# Check Maven
mvn -version

# Check PostgreSQL
psql --version

# Check Node
node -v
npm -v

# Check Git
git --version
```

---

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
```

---

# 3. BACKEND SETUP

## Project Structure

```
rwtool-backend/
├── src/
│   └── main/
│       ├── java/com/scgbs/rwtool/
│       │   ├── RwtoolBackendApplication.java
│       │   ├── config/
│       │   │   ├── WebConfig.java
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   └── OperationsController.java
│       │   ├── service/
│       │   │   ├── OperationsService.java
│       │   │   └── FileTransferService.java
│       │   ├── entity/
│       │   │   ├── PathConfig.java
│       │   │   ├── Report.java
│       │   │   └── TransferLog.java
│       │   ├── repository/
│       │   │   ├── PathConfigRepository.java
│       │   │   ├── ReportRepository.java
│       │   │   └── TransferLogRepository.java
│       │   └── dto/
│       │       ├── ReportDTO.java
│       │       ├── TransferLogDTO.java
│       │       ├── StatsDTO.java
│       │       └── SyncResponseDTO.java
│       └── resources/
│           └── application.properties
└── pom.xml
```

## File 1: pom.xml

**Location:** `pom.xml` (root of backend project)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.scgbs</groupId>
    <artifactId>rwtool-backend</artifactId>
    <version>1.0.0</version>
    <name>RW Tool Backend</name>
    <description>Operations Module for RW Tool</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Spring Boot DevTools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

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
```

## File 2: Entity Classes

### PathConfig.java

**Location:** `src/main/java/com/scgbs/rwtool/entity/PathConfig.java`

```java
package com.scgbs.rwtool.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "path_configs")
@Data
public class PathConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "unique_id", unique = true)
    private String uniqueId;
    
    @Column(length = 50)
    private String action;
    
    @Column(name = "input_file_name", length = 500)
    private String inputFileName;
    
    @Column(name = "file_type", length = 50)
    private String fileType;
    
    @Column(name = "output_folder_path", length = 500)
    private String outputFolderPath;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Report.java

**Location:** `src/main/java/com/scgbs/rwtool/entity/Report.java`

```java
package com.scgbs.rwtool.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String name;
    
    @Column(length = 50)
    private String status = "pending";
    
    @Column(name = "file_path", length = 1000)
    private String filePath;
    
    @OneToOne
    @JoinColumn(name = "path_config_id")
    private PathConfig pathConfig;
    
    @Column(name = "group_id")
    private Long groupId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### TransferLog.java

**Location:** `src/main/java/com/scgbs/rwtool/entity/TransferLog.java`

```java
package com.scgbs.rwtool.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_logs")
@Data
public class TransferLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "path_config_id")
    private PathConfig pathConfig;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(nullable = false, length = 50)
    private String status;
    
    @Column(length = 500)
    private String folder;
    
    @Column(name = "error_message", length = 2000)
    private String errorMessage;
    
    @Column(name = "transferred_at")
    private LocalDateTime transferredAt;
    
    @PrePersist
    protected void onCreate() {
        if (transferredAt == null) {
            transferredAt = LocalDateTime.now();
        }
    }
}
```

## File 3: Repository Interfaces

### PathConfigRepository.java

**Location:** `src/main/java/com/scgbs/rwtool/repository/PathConfigRepository.java`

```java
package com.scgbs.rwtool.repository;

import com.scgbs.rwtool.entity.PathConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PathConfigRepository extends JpaRepository<PathConfig, Long> {
    Optional<PathConfig> findByUniqueId(String uniqueId);
}
```

### ReportRepository.java

**Location:** `src/main/java/com/scgbs/rwtool/repository/ReportRepository.java`

```java
package com.scgbs.rwtool.repository;

import com.scgbs.rwtool.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);
    long countByStatus(String status);
    Optional<Report> findByPathConfigId(Long pathConfigId);
}
```

### TransferLogRepository.java

**Location:** `src/main/java/com/scgbs/rwtool/repository/TransferLogRepository.java`

```java
package com.scgbs.rwtool.repository;

import com.scgbs.rwtool.entity.TransferLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferLogRepository extends JpaRepository<TransferLog, Long> {
    long countByStatus(String status);
    List<TransferLog> findByTransferredAtBetween(LocalDateTime start, LocalDateTime end);
}
```

## File 4: DTO Classes

### ReportDTO.java

**Location:** `src/main/java/com/scgbs/rwtool/dto/ReportDTO.java`

```java
package com.scgbs.rwtool.dto;

import lombok.Data;

@Data
public class ReportDTO {
    private Long id;
    private String name;
    private String date;
    private String status;
    private String fileName;
    private String outputPath;
}
```

### TransferLogDTO.java

**Location:** `src/main/java/com/scgbs/rwtool/dto/TransferLogDTO.java`

```java
package com.scgbs.rwtool.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransferLogDTO {
    private Long id;
    private String reportName;
    private String reportDate;
    private String status;
    private String folder;
    private String errorMessage;
    private LocalDateTime transferredAt;
}
```

### SyncResponseDTO.java

**Location:** `src/main/java/com/scgbs/rwtool/dto/SyncResponseDTO.java`

```java
package com.scgbs.rwtool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyncResponseDTO {
    private boolean success;
    private String message;
    private String filePath;
}
```

### StatsDTO.java

**Location:** `src/main/java/com/scgbs/rwtool/dto/StatsDTO.java`

```java
package com.scgbs.rwtool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatsDTO {
    private long total;
    private long pending;
    private long synced;
    private long failed;
}
```

## File 5: Service Classes

### FileTransferService.java

**Location:** `src/main/java/com/scgbs/rwtool/service/FileTransferService.java`

```java
package com.scgbs.rwtool.service;

import com.scgbs.rwtool.entity.*;
import com.scgbs.rwtool.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class FileTransferService {
    
    @Autowired
    private PathConfigRepository pathConfigRepository;
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private TransferLogRepository transferLogRepository;
    
    @Value("${file.transfer.source.base}")
    private String sourceBase;
    
    @Value("${file.transfer.destination.base}")
    private String destinationBase;
    
    @Transactional
    public void syncFile(Long pathConfigId, Long userId) throws IOException {
        log.info("Starting sync for pathConfigId: {}", pathConfigId);
        
        // 1. Get path config
        PathConfig pathConfig = pathConfigRepository.findById(pathConfigId)
                .orElseThrow(() -> new RuntimeException("PathConfig not found: " + pathConfigId));
        
        // 2. Get corresponding report
        Report report = reportRepository.findByPathConfigId(pathConfigId)
                .orElseThrow(() -> new RuntimeException("Report not found for pathConfigId: " + pathConfigId));
        
        try {
            // 3. Build source path (flat folder)
            String sourcePathStr = sourceBase + "/" + pathConfig.getInputFileName();
            Path sourcePath = Paths.get(sourcePathStr);
            
            log.info("Source path: {}", sourcePathStr);
            
            // 4. Check if source file exists
            if (!Files.exists(sourcePath)) {
                throw new IOException("Source file not found: " + sourcePathStr);
            }
            
            // 5. Build destination path (dynamic based on output_folder_path)
            String destinationPathStr = destinationBase + "/" + 
                                       pathConfig.getOutputFolderPath() + "/" + 
                                       pathConfig.getInputFileName();
            Path destinationPath = Paths.get(destinationPathStr);
            
            log.info("Destination path: {}", destinationPathStr);
            
            // 6. Create destination directories if needed
            Files.createDirectories(destinationPath.getParent());
            
            // 7. Copy file
            Files.copy(sourcePath, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File copied successfully");
            
            // 8. Update report status to 'synced'
            report.setStatus("synced");
            report.setFilePath(destinationPathStr);
            report.setUpdatedAt(LocalDateTime.now());
            reportRepository.save(report);
            
            log.info("Report status updated to synced");
            
            // 9. Create transfer log (audit trail)
            TransferLog transferLog = new TransferLog();
            transferLog.setPathConfig(pathConfig);
            transferLog.setUserId(userId);
            transferLog.setStatus("synced");
            transferLog.setFolder(pathConfig.getOutputFolderPath());
            transferLog.setTransferredAt(LocalDateTime.now());
            transferLogRepository.save(transferLog);
            
            log.info("Transfer log created");
            
        } catch (Exception e) {
            log.error("Error syncing file: {}", e.getMessage(), e);
            
            // Update report to failed
            report.setStatus("failed");
            report.setUpdatedAt(LocalDateTime.now());
            reportRepository.save(report);
            
            // Create failed transfer log
            TransferLog failLog = new TransferLog();
            failLog.setPathConfig(pathConfig);
            failLog.setUserId(userId);
            failLog.setStatus("failed");
            failLog.setFolder(pathConfig.getOutputFolderPath());
            failLog.setErrorMessage(e.getMessage());
            failLog.setTransferredAt(LocalDateTime.now());
            transferLogRepository.save(failLog);
            
            throw new IOException("Failed to sync file: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void syncAllFiles(Long userId) {
        log.info("Starting sync all files");
        
        // Get all pending reports
        List<Report> pendingReports = reportRepository.findByStatus("pending");
        
        log.info("Found {} pending files to sync", pendingReports.size());
        
        int successCount = 0;
        int failCount = 0;
        
        for (Report report : pendingReports) {
            try {
                if (report.getPathConfig() != null) {
                    syncFile(report.getPathConfig().getId(), userId);
                    successCount++;
                }
            } catch (Exception e) {
                log.error("Failed to sync file {}: {}", report.getName(), e.getMessage());
                failCount++;
            }
        }
        
        log.info("Sync all completed. Success: {}, Failed: {}", successCount, failCount);
    }
}
```

### OperationsService.java

**Location:** `src/main/java/com/scgbs/rwtool/service/OperationsService.java`

```java
package com.scgbs.rwtool.service;

import com.scgbs.rwtool.dto.*;
import com.scgbs.rwtool.entity.*;
import com.scgbs.rwtool.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OperationsService {
    
    @Autowired
    private PathConfigRepository pathConfigRepository;
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private TransferLogRepository transferLogRepository;
    
    public List<ReportDTO> getPendingReports() {
        // Get all pending reports
        List<Report> pendingReports = reportRepository.findByStatus("pending");
        
        return pendingReports.stream()
                .map(report -> {
                    ReportDTO dto = new ReportDTO();
                    dto.setId(report.getId());
                    dto.setName(report.getName());
                    dto.setStatus(report.getStatus());
                    
                    // Extract date from name or use created date
                    dto.setDate(extractDateFromName(report.getName(), report.getCreatedAt()));
                    
                    // Get details from path_config
                    if (report.getPathConfig() != null) {
                        PathConfig pc = report.getPathConfig();
                        dto.setFileName(pc.getInputFileName());
                        dto.setOutputPath(pc.getOutputFolderPath());
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    public List<TransferLogDTO> getTransferLogs(LocalDate startDate, LocalDate endDate) {
        List<TransferLog> logs;
        
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(23, 59, 59);
            logs = transferLogRepository.findByTransferredAtBetween(start, end);
        } else {
            logs = transferLogRepository.findAll();
        }
        
        return logs.stream()
                .map(log -> {
                    TransferLogDTO dto = new TransferLogDTO();
                    dto.setId(log.getId());
                    dto.setStatus(log.getStatus());
                    dto.setFolder(log.getFolder());
                    dto.setErrorMessage(log.getErrorMessage());
                    dto.setTransferredAt(log.getTransferredAt());
                    
                    if (log.getPathConfig() != null) {
                        dto.setReportName(log.getPathConfig().getInputFileName());
                        dto.setReportDate(extractDateFromName(
                            log.getPathConfig().getInputFileName(), 
                            log.getTransferredAt()
                        ));
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    // Helper to extract date from filename
    private String extractDateFromName(String fileName, LocalDateTime fallbackDate) {
        try {
            // Try to extract date pattern YYYYMMDD from filename
            String[] parts = fileName.split("_");
            for (String part : parts) {
                if (part.matches("\\d{8}.*")) {
                    String dateStr = part.substring(0, 8);
                    return dateStr.substring(0, 4) + "-" + 
                           dateStr.substring(4, 6) + "-" + 
                           dateStr.substring(6, 8);
                }
            }
        } catch (Exception e) {
            // Ignore and use fallback
        }
        
        // Fallback to created/transferred date
        if (fallbackDate != null) {
            return fallbackDate.toLocalDate().toString();
        }
        
        return LocalDate.now().toString();
    }
}
```

## File 6: Controller

### OperationsController.java

**Location:** `src/main/java/com/scgbs/rwtool/controller/OperationsController.java`

```java
package com.scgbs.rwtool.controller;

import com.scgbs.rwtool.dto.*;
import com.scgbs.rwtool.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@Slf4j
public class OperationsController {
    
    @Autowired
    private OperationsService operationsService;
    
    @Autowired
    private FileTransferService fileTransferService;
    
    @GetMapping("/reports/pending")
    public ResponseEntity<List<ReportDTO>> getPendingReports() {
        log.info("GET /api/reports/pending");
        try {
            List<ReportDTO> reports = operationsService.getPendingReports();
            log.info("Returning {} pending reports", reports.size());
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/reports/{id}/sync")
    public ResponseEntity<SyncResponseDTO> syncReport(@PathVariable Long id) {
        log.info("POST /api/reports/{}/sync", id);
        
        try {
            // Hardcoded operations user ID
            // TODO: Get from JWT token when integrated
            Long userId = 3L;
            
            fileTransferService.syncFile(id, userId);
            
            log.info("Report {} synced successfully", id);
            return ResponseEntity.ok(new SyncResponseDTO(
                true, 
                "Report synced successfully", 
                null
            ));
            
        } catch (Exception e) {
            log.error("Error syncing report {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SyncResponseDTO(
                        false, 
                        "Failed to sync report: " + e.getMessage(), 
                        null
                    ));
        }
    }
    
    @PostMapping("/reports/sync-all")
    public ResponseEntity<SyncResponseDTO> syncAllReports() {
        log.info("POST /api/reports/sync-all");
        
        try {
            Long userId = 3L;
            
            fileTransferService.syncAllFiles(userId);
            
            log.info("All reports synced successfully");
            return ResponseEntity.ok(new SyncResponseDTO(
                true, 
                "All reports synced successfully", 
                null
            ));
            
        } catch (Exception e) {
            log.error("Error syncing all reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SyncResponseDTO(
                        false, 
                        "Failed to sync reports: " + e.getMessage(), 
                        null
                    ));
        }
    }
    
    @GetMapping("/transfer-logs")
    public ResponseEntity<List<TransferLogDTO>> getTransferLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/transfer-logs?startDate={}&endDate={}", startDate, endDate);
        
        try {
            List<TransferLogDTO> logs = operationsService.getTransferLogs(startDate, endDate);
            log.info("Returning {} transfer logs", logs.size());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error getting transfer logs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
```

## File 7: Configuration

### WebConfig.java

**Location:** `src/main/java/com/scgbs/rwtool/config/WebConfig.java`

```java
package com.scgbs.rwtool.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### SecurityConfig.java (Optional - If Using Spring Security)

**Location:** `src/main/java/com/scgbs/rwtool/config/SecurityConfig.java`

⚠️ Only create this if your project uses Spring Security!

```java
package com.scgbs.rwtool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## File 8: Main Application

### RwtoolBackendApplication.java

**Location:** `src/main/java/com/scgbs/rwtool/RwtoolBackendApplication.java`

⚠️ This file should already exist in your project! Only create if missing:

```java
package com.scgbs.rwtool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RwtoolBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(RwtoolBackendApplication.class, args);
    }
}
```

---

# 4. FRONTEND SETUP

## Important Note

⚠️ **DON'T TOUCH EXISTING FILES!**

Files you should NOT modify:
- ❌ App.js (already exists with routes)
- ❌ AuthContext.js (already exists with auth logic)
- ❌ axiosInstance.js (already exists with JWT)
- ❌ LoginScreen.jsx (already exists)
- ❌ Navbar.jsx (already exists)
- ❌ Sidebar.jsx (already exists)
- ❌ OpsPage.jsx (already exists - your teammate's version)
- ❌ OpsPage.css (already exists)
- ❌ Any other teammate's files!

## File to Add/Update

### opsService.js

**Location:** `src/services/opsService.js`

⚠️ This is YOUR file - create or replace it:

```javascript
import axiosInstance from './axiosInstance';

const opsService = {
  // Get pending reports
  getPendingReports: async () => {
    const response = await axiosInstance.get('/reports/pending');
    return response.data;
  },

  // Sync single report
  syncReport: async (reportId) => {
    const response = await axiosInstance.post(`/reports/${reportId}/sync`);
    return response.data;
  },

  // Sync all reports
  syncAllReports: async () => {
    const response = await axiosInstance.post('/reports/sync-all');
    return response.data;
  },

  // Get transfer logs with optional date filtering
  getTransferLogs: async (startDate, endDate) => {
    let url = '/transfer-logs';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default opsService;
```

## Verify axiosInstance.js

**Location:** `src/services/axiosInstance.js`

Make sure it looks like this (it should already exist):

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

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

---

# 7. TROUBLESHOOTING

## Issue 1: Backend Won't Start

### Error: "Port 8080 already in use"

**Solution:**

```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (use PID from above)
taskkill /PID <PID> /F

# Or change port in application.properties:
server.port=8081
```

### Error: "Database connection failed"

**Solution:**

1. Check PostgreSQL is running:
   - Windows Services → PostgreSQL
2. Verify database credentials in `application.properties`
3. Test connection:
   ```bash
   psql -U YOUR_USERNAME -d YOUR_DATABASE
   ```

## Issue 2: CORS Errors in Browser

**Error:** `blocked by CORS policy`

**Solution:**

1. Verify `WebConfig.java` exists
2. Check backend console shows:
   ```
   Mapped CORS configuration for /api/**
   ```
3. Restart backend after adding WebConfig

## Issue 3: "Failed to fetch pending reports"

**Solution:**

1. Check backend is running on port 8080
2. Test directly in browser:
   ```
   http://localhost:8080/api/reports/pending
   ```
3. Check browser console for actual error
4. Verify `axiosInstance.js` baseURL is correct

## Issue 4: "Source file not found"

**Solution:**

1. Check files exist in Source folder:
   ```cmd
   dir C:\Users\YOUR_USERNAME\Source
   ```
2. Verify filename matches exactly (case-sensitive!)
3. Check `application.properties` has correct source path

## Issue 5: Transfer Succeeds but File Not in Destination

**Solution:**

1. Check backend logs for actual destination path
2. Verify write permissions on Destination folder
3. Check `application.properties` destination path is correct

## Issue 6: JWT Token Error

**Error:** `401 Unauthorized`

**Solution:**

1. Login again to get fresh token
2. Check token is being sent in request headers (F12 → Network tab)
3. Verify `axiosInstance.js` interceptor is adding token

---

# 8. FINAL CHECKLIST

## Before Starting

```
□ Java 17+ installed
□ Maven installed
□ PostgreSQL installed and running
□ Node.js installed
□ Git installed
□ Have database credentials
□ Know your office username
```

## Database

```
□ Connected to office database
□ Created 3 tables (path_configs, reports, transfer_logs)
□ Inserted sample data
□ Verified 5 pending reports exist
```

## Backend

```
□ Updated application.properties with:
  - Database credentials
  - File paths (with YOUR username)
□ Created all entity/repository/service/controller files
□ Added WebConfig.java for CORS
□ Backend builds successfully (mvn clean install)
□ Backend runs on port 8080
□ Can access http://localhost:8080/api/reports/pending in browser
```

## Frontend

```
□ Updated/created opsService.js (uses axiosInstance)
□ Verified axiosInstance.js exists and correct
□ OpsPage.jsx already exists (don't modify)
□ Frontend runs on port 3000
□ Can login as operations@sc.com
```

## File System

```
□ Created C:\Users\YOUR_USERNAME\Source
□ Created C:\Users\YOUR_USERNAME\Destination
□ Put 5 test files in Source folder
```

## Testing

```
□ Backend responds with JSON at /api/reports/pending
□ Frontend shows 5 pending reports
□ Can sync single file successfully
□ File appears in correct destination folder
□ Transfer log created in database
□ Can sync all files
□ All 5 files in correct destinations
```

---

# Quick Reference

## Start Commands

**Backend:**
```bash
cd rwtool-backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd rwtool-frontend
npm start
```

## Login Credentials

```
Email: operations@sc.com
Password: 123
```

## Test Flow

1. Login as operations user
2. Navigate to Operations page
3. See 5 pending reports
4. Click "Sync All"
5. Verify files in destination folders
6. Check transfer logs in UI and database

---

# Architecture Overview

## Data Flow

```
Admin Module → path_configs table (file requests)
                    ↓
Operations Module reads path_configs
                    ↓
Transfers file: Source (flat) → Destination (dynamic folders)
                    ↓
Updates reports table (status='synced', file_path)
                    ↓
Creates transfer_logs (audit trail)
                    ↓
User Module reads reports table (for downloads)
```

## API Endpoints

```
GET  /api/reports/pending          → Get pending reports
POST /api/reports/{id}/sync        → Sync single report
POST /api/reports/sync-all         → Sync all pending reports
GET  /api/transfer-logs            → Get transfer logs (with date filter)
```

## Tables

```
path_configs    → Request metadata (from Admin API)
reports         → Global status (for User downloads)
transfer_logs   → Audit trail (Operations tracking)
```

---

# Support

If you encounter issues:

1. Check backend console logs
2. Check browser console (F12)
3. Verify database has data
4. Test backend endpoints directly in browser
5. Check file paths in application.properties
6. Verify CORS configuration

---

**End of Documentation**

**Version:** 1.0  
**Last Updated:** October 30, 2025  
**Author:** Operations Module Team
