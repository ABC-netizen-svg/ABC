# 🚀 SCGBS Reports - Complete Setup Guide (Windows)

**From Scratch Setup Guide - Everything Included**

Version: 1.0  
Date: January 2025  
Platform: Windows

---

## 📋 Table of Contents

1. [Prerequisites Installation](#1-prerequisites-installation)
2. [Database Setup](#2-database-setup)
3. [Backend Setup - Spring Boot](#3-backend-setup)
4. [Frontend Setup - React](#4-frontend-setup)
5. [Testing Guide](#5-testing-guide)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites Installation

### 1.1 Install PostgreSQL 16

**Download:**
- Go to: https://www.postgresql.org/download/windows/
- Download PostgreSQL 16 installer
- Run installer

**During Installation:**
- Password: Choose a password (remember it!)
- Port: 5432 (default)
- Locale: Default

**Verify Installation:**
```cmd
psql --version
```

---

### 1.2 Install Java 17

**Download:**
- Go to: https://adoptium.net/
- Download Eclipse Temurin 17 (LTS)
- Install with default settings

**Verify:**
```cmd
java -version
```

Should show: `openjdk version "17.x.x"`

---

### 1.3 Install Node.js

**Download:**
- Go to: https://nodejs.org/
- Download LTS version (20.x)
- Install with default settings

**Verify:**
```cmd
node --version
npm --version
```

---

### 1.4 Install IntelliJ IDEA

**Download:**
- Go to: https://www.jetbrains.com/idea/download/
- Download Community Edition (Free)
- Install with default settings

---

### 1.5 Install Git (Optional but Recommended)

**Download:**
- Go to: https://git-scm.com/download/win
- Install with default settings

---

## 2. Database Setup

### 2.1 Connect to PostgreSQL

**Open Command Prompt as Administrator:**

```cmd
psql -U postgres
```

Enter your PostgreSQL password.

---

### 2.2 Create Database

```sql
-- Create database
CREATE DATABASE myappdb;

-- Connect to it
\c myappdb

-- Verify connection
SELECT current_database();
```

---

### 2.3 Create All Tables

**Copy and paste this entire block:**

```sql
-- ================================================
-- TABLE CREATION
-- ================================================

-- 1. roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access'),
('User', 'Regular user'),
('Operations', 'Operations team - file transfers');

-- 2. users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (email, password, role_id) VALUES
('admin@scgbs.com', 'hashed_password', 1),
('ops@scgbs.com', 'hashed_password', 3);

-- 3. groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO groups (name, description) VALUES
('Finance', 'Financial reports'),
('HR', 'Human Resources'),
('IT', 'IT infrastructure');

-- 4. reports table (ONLY file_path column)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. path_configs table (with group_id FK)
CREATE TABLE path_configs (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    ad_group VARCHAR(255) NOT NULL,
    description TEXT,
    path VARCHAR(500) NOT NULL,
    reports TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ⚠️ IMPORTANT: Replace YOUR_USERNAME with your Windows username
-- Find it by running: echo %USERNAME% in command prompt

INSERT INTO path_configs (group_id, ad_group, path, description) VALUES
(1, 'Finance', 'C:/Users/YOUR_USERNAME/demo-reports/source/Finance/', 'Finance source path'),
(2, 'HR', 'C:/Users/YOUR_USERNAME/demo-reports/source/HR/', 'HR source path'),
(3, 'IT', 'C:/Users/YOUR_USERNAME/demo-reports/source/IT/', 'IT source path');

-- 6. subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. access_requests table
CREATE TABLE access_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id)
);

-- 8. transfer_logs table
CREATE TABLE transfer_logs (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    status VARCHAR(50) NOT NULL,
    folder VARCHAR(500),
    error_message TEXT,
    transferred_at TIMESTAMP DEFAULT NOW()
);

-- Insert test reports
INSERT INTO reports (name, date, group_id, status, file_path) VALUES
('daily_sales.csv', CURRENT_DATE, 1, 'pending', NULL),
('monthly_revenue.csv', CURRENT_DATE, 1, 'pending', NULL);

-- Verify all tables created
\dt

-- Should show 8 tables:
-- access_requests, groups, path_configs, reports, 
-- roles, subscriptions, transfer_logs, users
```

---

### 2.4 Create Test Files

**Open Command Prompt:**

```cmd
REM Get your username
echo %USERNAME%

REM Create folders (replace YOUR_USERNAME)
mkdir C:\Users\YOUR_USERNAME\demo-reports\source\Finance
mkdir C:\Users\YOUR_USERNAME\demo-reports\source\HR
mkdir C:\Users\YOUR_USERNAME\demo-reports\source\IT
mkdir C:\Users\YOUR_USERNAME\demo-reports\destination\Finance
mkdir C:\Users\YOUR_USERNAME\demo-reports\destination\HR
mkdir C:\Users\YOUR_USERNAME\demo-reports\destination\IT

REM Verify folders created
dir C:\Users\YOUR_USERNAME\demo-reports
```

**Create Test CSV Files:**

Create file: `C:\Users\YOUR_USERNAME\demo-reports\source\Finance\daily_sales.csv`

```csv
Date,Product,Amount,Region
2025-01-28,Product A,5000,North
2025-01-28,Product B,3000,South
2025-01-28,Product C,4000,East
2025-01-28,Product D,2000,West
```

Create file: `C:\Users\YOUR_USERNAME\demo-reports\source\Finance\monthly_revenue.csv`

```csv
Month,Revenue,Profit,Growth
January,150000,45000,12%
February,165000,50000,15%
March,180000,55000,18%
April,200000,60000,20%
```

---

## 3. Backend Setup

### 3.1 Create Spring Boot Project

**Option A: Using Spring Initializr (Recommended)**

1. Go to: https://start.spring.io/
2. Configure:
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.0
   - Group: com.example
   - Artifact: demo
   - Name: demo
   - Packaging: Jar
   - Java: 17
3. Add Dependencies:
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver
   - Lombok
   - Spring Boot DevTools
4. Click "Generate"
5. Extract ZIP file to a folder (e.g., `C:\Projects\scgbs-backend`)

**Option B: Create in IntelliJ**

1. Open IntelliJ IDEA
2. File → New → Project
3. Select "Spring Initializr"
4. Follow same configuration as above

---

### 3.2 Project Structure

```
scgbs-backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           └── demo/
│       │               ├── DemoApplication.java
│       │               ├── config/
│       │               │   └── WebConfig.java
│       │               ├── controller/
│       │               │   ├── ReportController.java
│       │               │   └── TransferLogController.java
│       │               ├── dto/
│       │               │   ├── ReportDTO.java
│       │               │   ├── SyncResponseDTO.java
│       │               │   ├── SyncAllResponseDTO.java
│       │               │   └── TransferLogDTO.java
│       │               ├── entity/
│       │               │   ├── Report.java
│       │               │   ├── Group.java
│       │               │   ├── PathConfig.java
│       │               │   ├── TransferLog.java
│       │               │   ├── User.java
│       │               │   └── Role.java
│       │               ├── repository/
│       │               │   ├── ReportRepository.java
│       │               │   ├── PathConfigRepository.java
│       │               │   ├── TransferLogRepository.java
│       │               │   └── UserRepository.java
│       │               └── service/
│       │                   ├── ReportService.java
│       │                   ├── FileTransferService.java
│       │                   └── TransferLogService.java
│       └── resources/
│           └── application.properties
└── pom.xml
```

---

### 3.3 pom.xml

**File:** `pom.xml`

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
    
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>SCGBS Reports Operations Module</description>
    
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

---

### 3.4 application.properties

**File:** `src/main/resources/application.properties`

```properties
spring.application.name=scgbs-reports
server.port=8080

# PostgreSQL Configuration
# ⚠️ Replace YOUR_PASSWORD with your actual PostgreSQL password
spring.datasource.url=jdbc:postgresql://localhost:5432/myappdb
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.com.example.demo=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# File Transfer Configuration
# ⚠️ Replace YOUR_USERNAME with your Windows username
file.transfer.destination.base=C:/Users/YOUR_USERNAME/demo-reports/destination
```

---

### 3.5 Main Application

**File:** `src/main/java/com/example/demo/DemoApplication.java`

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

### 3.6 Configuration

**File:** `src/main/java/com/example/demo/config/WebConfig.java`

```java
package com.example.demo.config;

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

---

### 3.7 Entity Classes

**File:** `src/main/java/com/example/demo/entity/Role.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

**File:** `src/main/java/com/example/demo/entity/User.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

**File:** `src/main/java/com/example/demo/entity/Group.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

**File:** `src/main/java/com/example/demo/entity/Report.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @Column(length = 50)
    private String status = "pending";
    
    @Column(name = "file_path", length = 500)
    private String filePath;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

**File:** `src/main/java/com/example/demo/entity/PathConfig.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "path_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PathConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @Column(name = "ad_group")
    private String adGroup;
    
    private String description;
    
    @Column(nullable = false, length = 500)
    private String path;
    
    private String reports;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

**File:** `src/main/java/com/example/demo/entity/TransferLog.java`

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 50)
    private String status;
    
    @Column(length = 500)
    private String folder;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "transferred_at")
    private LocalDateTime transferredAt = LocalDateTime.now();
}
```

---

### 3.8 Repository Classes

**File:** `src/main/java/com/example/demo/repository/ReportRepository.java`

```java
package com.example.demo.repository;

import com.example.demo.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByStatusOrderByDateDesc(String status);
    
    long countByStatus(String status);
}
```

---

**File:** `src/main/java/com/example/demo/repository/PathConfigRepository.java`

```java
package com.example.demo.repository;

import com.example.demo.entity.PathConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PathConfigRepository extends JpaRepository<PathConfig, Long> {
    
    Optional<PathConfig> findByGroupId(Long groupId);
}
```

---

**File:** `src/main/java/com/example/demo/repository/TransferLogRepository.java`

```java
package com.example.demo.repository;

import com.example.demo.entity.TransferLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferLogRepository extends JpaRepository<TransferLog, Long> {
    
    List<TransferLog> findTop50ByOrderByTransferredAtDesc();
    
    List<TransferLog> findByTransferredAtBetweenOrderByTransferredAtDesc(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    long countByStatus(String status);
}
```

---

**File:** `src/main/java/com/example/demo/repository/UserRepository.java`

```java
package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
}
```

---

### 3.9 DTO Classes

**File:** `src/main/java/com/example/demo/dto/ReportDTO.java`

```java
package com.example.demo.dto;

import com.example.demo.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long id;
    private String name;
    private LocalDate date;
    private Long groupId;
    private String groupName;
    private String status;
    private String filePath;
    
    public static ReportDTO fromEntity(Report report) {
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setName(report.getName());
        dto.setDate(report.getDate());
        dto.setGroupId(report.getGroup().getId());
        dto.setGroupName(report.getGroup().getName());
        dto.setStatus(report.getStatus());
        dto.setFilePath(report.getFilePath());
        return dto;
    }
}
```

---

**File:** `src/main/java/com/example/demo/dto/SyncResponseDTO.java`

```java
package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncResponseDTO {
    private boolean success;
    private String message;
    private ReportDTO report;
}
```

---

**File:** `src/main/java/com/example/demo/dto/SyncAllResponseDTO.java`

```java
package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncAllResponseDTO {
    private boolean success;
    private String message;
    private int totalProcessed;
    private int successCount;
    private int failureCount;
    private List<ReportDTO> syncedReports;
    private List<ReportDTO> failedReports;
}
```

---

**File:** `src/main/java/com/example/demo/dto/TransferLogDTO.java`

```java
package com.example.demo.dto;

import com.example.demo.entity.TransferLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferLogDTO {
    private Long id;
    private Long reportId;
    private String reportName;
    private LocalDate reportDate;
    private Long userId;
    private String userEmail;
    private String status;
    private String folder;
    private String errorMessage;
    private LocalDateTime transferredAt;
    
    public static TransferLogDTO fromEntity(TransferLog log) {
        TransferLogDTO dto = new TransferLogDTO();
        dto.setId(log.getId());
        dto.setReportId(log.getReport().getId());
        dto.setReportName(log.getReport().getName());
        dto.setReportDate(log.getReport().getDate());
        dto.setUserId(log.getUser().getId());
        dto.setUserEmail(log.getUser().getEmail());
        dto.setStatus(log.getStatus());
        dto.setFolder(log.getFolder());
        dto.setErrorMessage(log.getErrorMessage());
        dto.setTransferredAt(log.getTransferredAt());
        return dto;
    }
}
```

---

### 3.10 Service Classes

**File:** `src/main/java/com/example/demo/service/FileTransferService.java`

```java
package com.example.demo.service;

import com.example.demo.entity.PathConfig;
import com.example.demo.entity.Report;
import com.example.demo.repository.PathConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileTransferService {
    
    private final PathConfigRepository pathConfigRepository;
    
    @Value("${file.transfer.destination.base}")
    private String destinationBasePath;
    
    public String[] generatePaths(Report report) {
        log.debug("Generating paths for report: {}", report.getName());
        
        Long groupId = report.getGroup().getId();
        
        PathConfig config = pathConfigRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException(
                    "Path config not found for group_id: " + groupId));
        
        String sourceBasePath = config.getPath();
        String sourcePath = sourceBasePath + report.getName();
        
        String groupFolder = report.getGroup().getName();
        String destinationPath = destinationBasePath + "/" + groupFolder + "/" + report.getName();
        
        log.info("Source: {}", sourcePath);
        log.info("Destination: {}", destinationPath);
        
        return new String[]{sourcePath, destinationPath};
    }
    
    public boolean transferFile(String sourcePath, String destinationPath) {
        try {
            Path source = Paths.get(sourcePath);
            Path destination = Paths.get(destinationPath);
            
            if (!Files.exists(source)) {
                log.error("Source file does not exist: {}", sourcePath);
                return false;
            }
            
            Path destinationDir = destination.getParent();
            if (destinationDir != null && !Files.exists(destinationDir)) {
                Files.createDirectories(destinationDir);
                log.info("Created destination directory: {}", destinationDir);
            }
            
            Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
            log.info("File copied successfully");
            
            if (Files.exists(destination)) {
                long sourceSize = Files.size(source);
                long destSize = Files.size(destination);
                
                if (sourceSize == destSize) {
                    log.info("File transferred successfully. Size: {} bytes", sourceSize);
                    return true;
                } else {
                    log.error("File size mismatch! Source: {}, Dest: {}", sourceSize, destSize);
                    return false;
                }
            }
            
            return false;
            
        } catch (IOException e) {
            log.error("Error transferring file: {}", e.getMessage(), e);
            return false;
        }
    }
}
```

---

**File:** `src/main/java/com/example/demo/service/ReportService.java`

```java
package com.example.demo.service;

import com.example.demo.dto.ReportDTO;
import com.example.demo.dto.SyncAllResponseDTO;
import com.example.demo.dto.SyncResponseDTO;
import com.example.demo.entity.Report;
import com.example.demo.entity.TransferLog;
import com.example.demo.entity.User;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.TransferLogRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    
    private final ReportRepository reportRepository;
    private final TransferLogRepository transferLogRepository;
    private final UserRepository userRepository;
    private final FileTransferService fileTransferService;
    
    public List<ReportDTO> getPendingReports() {
        log.debug("Fetching pending reports");
        
        List<Report> reports = reportRepository.findByStatusOrderByDateDesc("pending");
        
        return reports.stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SyncResponseDTO syncReport(Long reportId, Long userId) {
        log.info("Syncing report ID: {} by user ID: {}", reportId, userId);
        
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
            
            if (!"pending".equals(report.getStatus())) {
                String message = "Report already synced";
                log.warn(message);
                return new SyncResponseDTO(false, message, ReportDTO.fromEntity(report));
            }
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            
            String[] paths = fileTransferService.generatePaths(report);
            String sourcePath = paths[0];
            String destinationPath = paths[1];
            
            boolean success = fileTransferService.transferFile(sourcePath, destinationPath);
            
            if (success) {
                report.setStatus("synced");
                report.setFilePath(destinationPath);
                report.setUpdatedAt(LocalDateTime.now());
                reportRepository.save(report);
                
                createTransferLog(report, user, "synced", destinationPath, null);
                
                log.info("Report {} synced successfully", report.getId());
                return new SyncResponseDTO(
                    true, 
                    "File transferred successfully to " + destinationPath,
                    ReportDTO.fromEntity(report)
                );
            } else {
                report.setStatus("failed");
                report.setUpdatedAt(LocalDateTime.now());
                reportRepository.save(report);
                
                createTransferLog(report, user, "failed", null, "File transfer failed");
                
                log.error("Report {} sync failed", report.getId());
                return new SyncResponseDTO(false, "File transfer failed", ReportDTO.fromEntity(report));
            }
            
        } catch (Exception e) {
            log.error("Error syncing report {}: {}", reportId, e.getMessage(), e);
            return new SyncResponseDTO(false, "Error: " + e.getMessage(), null);
        }
    }
    
    @Transactional
    public SyncAllResponseDTO syncAllReports(Long userId) {
        log.info("Syncing all pending reports by user ID: {}", userId);
        
        List<Report> pendingReports = reportRepository.findByStatusOrderByDateDesc("pending");
        
        if (pendingReports.isEmpty()) {
            log.info("No pending reports to sync");
            return new SyncAllResponseDTO(
                true, 
                "No pending reports to sync", 
                0, 0, 0, 
                new ArrayList<>(), 
                new ArrayList<>()
            );
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        List<ReportDTO> syncedReports = new ArrayList<>();
        List<ReportDTO> failedReports = new ArrayList<>();
        
        for (Report report : pendingReports) {
            try {
                String[] paths = fileTransferService.generatePaths(report);
                String sourcePath = paths[0];
                String destinationPath = paths[1];
                
                boolean success = fileTransferService.transferFile(sourcePath, destinationPath);
                
                if (success) {
                    report.setStatus("synced");
                    report.setFilePath(destinationPath);
                    report.setUpdatedAt(LocalDateTime.now());
                    reportRepository.save(report);
                    
                    createTransferLog(report, user, "synced", destinationPath, null);
                    syncedReports.add(ReportDTO.fromEntity(report));
                    
                    log.info("Report {} synced successfully", report.getId());
                } else {
                    report.setStatus("failed");
                    report.setUpdatedAt(LocalDateTime.now());
                    reportRepository.save(report);
                    
                    createTransferLog(report, user, "failed", null, "File transfer failed");
                    failedReports.add(ReportDTO.fromEntity(report));
                    
                    log.error("Report {} sync failed", report.getId());
                }
                
            } catch (Exception e) {
                log.error("Error syncing report {}: {}", report.getId(), e.getMessage(), e);
                
                report.setStatus("failed");
                report.setUpdatedAt(LocalDateTime.now());
                reportRepository.save(report);
                
                createTransferLog(report, user, "failed", null, e.getMessage());
                failedReports.add(ReportDTO.fromEntity(report));
            }
        }
        
        int total = pendingReports.size();
        int success = syncedReports.size();
        int failed = failedReports.size();
        
        String message = String.format("Processed %d reports: %d succeeded, %d failed", total, success, failed);
        
        log.info(message);
        
        return new SyncAllResponseDTO(true, message, total, success, failed, syncedReports, failedReports);
    }
    
    public java.util.Map<String, Long> getReportStats() {
        long total = reportRepository.count();
        long pending = reportRepository.countByStatus("pending");
        long synced = reportRepository.countByStatus("synced");
        long failed = reportRepository.countByStatus("failed");
        
        return java.util.Map.of(
            "total", total,
            "pending", pending,
            "synced", synced,
            "failed", failed
        );
    }
    
    private TransferLog createTransferLog(Report report, User user, String status, 
                                         String fullDestinationPath, String errorMessage) {
        TransferLog log = new TransferLog();
        log.setReport(report);
        log.setUser(user);
        log.setStatus(status);
        
        if (fullDestinationPath != null) {
            String folderName = report.getGroup().getName();
            log.setFolder(folderName);
        }
        
        log.setErrorMessage(errorMessage);
        log.setTransferredAt(LocalDateTime.now());
        
        return transferLogRepository.save(log);
    }
}
```

---

**File:** `src/main/java/com/example/demo/service/TransferLogService.java`

```java
package com.example.demo.service;

import com.example.demo.dto.TransferLogDTO;
import com.example.demo.entity.TransferLog;
import com.example.demo.repository.TransferLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransferLogService {
    
    private final TransferLogRepository transferLogRepository;
    
    public List<TransferLogDTO> getRecentLogs() {
        log.debug("Fetching recent transfer logs");
        
        List<TransferLog> logs = transferLogRepository.findTop50ByOrderByTransferredAtDesc();
        
        return logs.stream()
                .map(TransferLogDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TransferLogDTO> getLogsBetweenDates(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching logs between {} and {}", startDate, endDate);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        List<TransferLog> logs = transferLogRepository
                .findByTransferredAtBetweenOrderByTransferredAtDesc(start, end);
        
        return logs.stream()
                .map(TransferLogDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public java.util.Map<String, Long> getLogStats() {
        long total = transferLogRepository.count();
        long synced = transferLogRepository.countByStatus("synced");
        long failed = transferLogRepository.countByStatus("failed");
        
        return java.util.Map.of(
            "total", total,
            "synced", synced,
            "failed", failed
        );
    }
}
```

---

### 3.11 Controller Classes

**File:** `src/main/java/com/example/demo/controller/ReportController.java`

```java
package com.example.demo.controller;

import com.example.demo.dto.ReportDTO;
import com.example.demo.dto.SyncAllResponseDTO;
import com.example.demo.dto.SyncResponseDTO;
import com.example.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    
    private final ReportService reportService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Operations Module - Report Controller",
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<ReportDTO>> getPendingReports() {
        log.info("GET /api/reports/pending");
        
        List<ReportDTO> reports = reportService.getPendingReports();
        
        log.info("Returning {} pending reports", reports.size());
        return ResponseEntity.ok(reports);
    }
    
    @PutMapping("/{id}/sync")
    public ResponseEntity<SyncResponseDTO> syncReport(@PathVariable Long id) {
        log.info("PUT /api/reports/{}/sync", id);
        
        Long userId = 2L;
        
        SyncResponseDTO response = reportService.syncReport(id, userId);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/sync-all")
    public ResponseEntity<SyncAllResponseDTO> syncAllReports() {
        log.info("POST /api/reports/sync-all");
        
        Long userId = 2L;
        
        SyncAllResponseDTO response = reportService.syncAllReports(userId);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getReportStats() {
        log.info("GET /api/reports/stats");
        
        Map<String, Long> stats = reportService.getReportStats();
        
        return ResponseEntity.ok(stats);
    }
}
```

---

**File:** `src/main/java/com/example/demo/controller/TransferLogController.java`

```java
package com.example.demo.controller;

import com.example.demo.dto.TransferLogDTO;
import com.example.demo.service.TransferLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfer-logs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class TransferLogController {
    
    private final TransferLogService transferLogService;
    
    @GetMapping("/recent")
    public ResponseEntity<List<TransferLogDTO>> getRecentLogs() {
        log.info("GET /api/transfer-logs/recent");
        
        List<TransferLogDTO> logs = transferLogService.getRecentLogs();
        
        log.info("Returning {} recent logs", logs.size());
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping
    public ResponseEntity<List<TransferLogDTO>> getLogsBetweenDates(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/transfer-logs - Between {} and {}", startDate, endDate);
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<TransferLogDTO> logs = transferLogService.getLogsBetweenDates(startDate, endDate);
        
        log.info("Returning {} logs", logs.size());
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getLogStats() {
        log.info("GET /api/transfer-logs/stats");
        
        Map<String, Long> stats = transferLogService.getLogStats();
        
        return ResponseEntity.ok(stats);
    }
}
```

---

## 4. Frontend Setup

### 4.1 Create React App

**Open Command Prompt:**

```cmd
cd C:\Projects

npx create-react-app scgbs-frontend

cd scgbs-frontend
```

---

### 4.2 Install Dependencies

```cmd
npm install axios bootstrap bootstrap-icons
```

---

### 4.3 Project Structure

```
scgbs-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── notification/
│   │       ├── notification.jsx
│   │       └── notification.css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── OpsPage.jsx
│   │   └── OpsPage.css
│   ├── services/
│   │   └── opsService.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .env
└── package.json
```

---

### 4.4 Environment Configuration

**File:** `.env`

```
REACT_APP_API_URL=http://localhost:8080/api
```

---

### 4.5 Context

**File:** `src/context/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token] = useState('mock-token');
  const [user] = useState({ id: 2, email: 'ops@scgbs.com', role: 'Operations' });

  return (
    <AuthContext.Provider value={{ token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 4.6 Service

**File:** `src/services/opsService.js`

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const opsService = {
  getPendingReports: async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      throw error;
    }
  },

  syncReport: async (reportId) => {
    try {
      const response = await axios.put(`${API_URL}/reports/${reportId}/sync`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing report ${reportId}:`, error);
      throw error;
    }
  },

  syncAllReports: async () => {
    try {
      const response = await axios.post(`${API_URL}/reports/sync-all`);
      return response.data;
    } catch (error) {
      console.error('Error syncing all reports:', error);
      throw error;
    }
  },

  getReportStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report stats:', error);
      throw error;
    }
  },

  getTransferLogs: async (startDate = null, endDate = null) => {
    try {
      let url = `${API_URL}/transfer-logs/recent`;
      
      if (startDate && endDate) {
        url = `${API_URL}/transfer-logs?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer logs:', error);
      throw error;
    }
  },

  getTransferLogStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/transfer-logs/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer log stats:', error);
      throw error;
    }
  },
};

export default opsService;
```

---

### 4.7 Notification Component

**File:** `src/components/notification/notification.jsx`

```jsx
import React from 'react';
import './notification.css';

const Notification = ({ reports, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="notification-backdrop" onClick={onClose}></div>
      
      <div className="notification-panel">
        <div className="notification-header">
          <h5>Pending Reports</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        
        <div className="notification-body">
          {reports.length === 0 ? (
            <p className="text-muted text-center">No pending reports</p>
          ) : (
            <ul className="list-group">
              {reports.map((report) => (
                <li key={report.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{report.name}</strong>
                      <br />
                      <small className="text-muted">
                        {report.groupName} • {report.date}
                      </small>
                    </div>
                    <span className="badge bg-warning">Pending</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Notification;
```

---

**File:** `src/components/notification/notification.css`

```css
.notification-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.notification-panel {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 350px;
  max-height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notification-header {
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.notification-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.notification-body {
  padding: 10px;
  overflow-y: auto;
  flex: 1;
}

.notification-body .list-group-item {
  border: none;
  border-bottom: 1px solid #dee2e6;
  padding: 12px 10px;
}

.notification-body .list-group-item:last-child {
  border-bottom: none;
}

.notification-body .list-group-item:hover {
  background-color: #f8f9fa;
}
```

---

### 4.8 Operations Page

**File:** `src/pages/OpsPage.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import opsService from '../services/opsService';
import "./OpsPage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Notification from '../components/notification/notification';

const OpsPage = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchReports, setSearchReports] = useState("");
  const [searchLogs, setSearchLogs] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSyncIndex, setCurrentSyncIndex] = useState(0);
  const [totalSync, setTotalSync] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingReports();
    fetchTransferLogs();
  }, []);

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      const data = await opsService.getPendingReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferLogs = async () => {
    try {
      const data = await opsService.getTransferLogs(startDate, endDate);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch transfer logs:', err);
    }
  };

  const handleSync = async (reportId) => {
    try {
      setIsSyncing(true);
      setCurrentSyncIndex(1);
      setTotalSync(1);

      const result = await opsService.syncReport(reportId);

      await fetchPendingReports();
      await fetchTransferLogs();

      setError(null);
    } catch (err) {
      setError(`Failed to sync report: ${err.message}`);
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'Pending');
    if (pendingReports.length === 0) return;

    try {
      setIsSyncing(true);
      setTotalSync(pendingReports.length);

      const result = await opsService.syncAllReports();

      await fetchPendingReports();
      await fetchTransferLogs();

      setError(null);
    } catch (err) {
      setError(`Failed to sync all reports: ${err.message}`);
      console.error(err);
    } finally {
      setIsSyncing(false);
      setCurrentSyncIndex(0);
      setTotalSync(0);
    }
  };

  const isWithinDateRange = (log) => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log.transferredAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || logDate >= start) && (!end || logDate <= end);
  };

  const filteredReports = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(searchReports.toLowerCase()) ||
      r.date.includes(searchReports)
  );

  const filteredLogs = logs.filter(
    (log) =>
      log.reportName.toLowerCase().includes(searchLogs.toLowerCase()) &&
      isWithinDateRange(log)
  );

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.transferredAt) - new Date(a.transferredAt)
  );

  const totalReports = reports.length + logs.filter(l => l.status === 'synced' || l.status === 'failed').length;
  const syncedReports = logs.filter((l) => l.status === 'synced').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4 ops-page">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Operations Dashboard</h2>
        <div className="position-relative">
          <button
            className="btn btn-outline-primary position-relative"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <i className="bi bi-bell-fill"></i>
            {pendingReports > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {pendingReports}
              </span>
            )}
          </button>
          <Notification
            reports={reports}
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card">
            <div className="card-body">
              <h5 className="card-title">Total Reports</h5>
              <p className="card-text fs-4">{totalReports}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card synced">
            <div className="card-body">
              <h5 className="card-title">Synced Reports</h5>
              <p className="card-text fs-4">{syncedReports}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card pending">
            <div className="card-body">
              <h5 className="card-title">Pending Reports</h5>
              <p className="card-text fs-4">{pendingReports}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="mb-2 fw-semibold">Reports to be Synced</h4>

        {isSyncing && (
          <div className="mb-2 text-info fw-semibold">
            Syncing report {currentSyncIndex} of {totalSync}...
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name or date..."
            value={searchReports}
            onChange={(e) => setSearchReports(e.target.value)}
            className="form-control w-75"
          />
          <button
            onClick={handleSyncAll}
            className="btn btn-success btn-sm"
            disabled={pendingReports === 0 || isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>

        <div className="table-container">
          <table className="table table-striped table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Report Name</th>
                <th>Report Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="fade-in">
                    <td>{report.id}</td>
                    <td>{report.name}</td>
                    <td>{report.date}</td>
                    <td className="text-warning fw-bold">{report.status}</td>
                    <td>
                      <button
                        onClick={() => handleSync(report.id)}
                        className="btn btn-primary btn-sm"
                        disabled={isSyncing}
                      >
                        {isSyncing ? 'Syncing...' : 'Sync'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No reports to be synced found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="mb-2 fw-semibold">Transfer Logs</h4>
        <div className="d-flex mb-3 gap-2 flex-wrap align-items-center">
          <input
            type="text"
            placeholder="Search Logs..."
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
            className="form-control"
          />
          <div className="d-flex gap-2 align-items-center">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                fetchTransferLogs();
              }}
              className="form-control"
            />
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                fetchTransferLogs();
              }}
              className="form-control"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table table-striped table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Report Name</th>
                <th>Report Date</th>
                <th>Status</th>
                <th>Folder</th>
                <th>Transfer Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="fade-in">
                    <td>{log.id}</td>
                    <td>{log.reportName}</td>
                    <td>{log.reportDate}</td>
                    <td
                      className={
                        log.status === 'synced'
                          ? "text-success fw-bold"
                          : "text-danger fw-bold"
                      }
                    >
                      {log.status}
                      {log.errorMessage && <span className="ms-1" title={log.errorMessage}>❗</span>}
                    </td>
                    <td>{log.folder}</td>
                    <td>
                      {new Date(log.transferredAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No logs found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpsPage;
```

---

**File:** `src/pages/OpsPage.css`

```css
.ops-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.summary-card {
  border: none;
  border-left: 4px solid #007bff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.summary-card.synced {
  border-left-color: #28a745;
}

.summary-card.pending {
  border-left-color: #ffc107;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 500px;
  overflow-y: auto;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-primary:disabled,
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

### 4.9 App Component

**File:** `src/App.js`

```jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import OpsPage from './pages/OpsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <OpsPage />
      </div>
    </AuthProvider>
  );
}

export default App;
```

---

### 4.10 package.json

**File:** `package.json`

```json
{
  "name": "scgbs-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^1.6.2",
    "bootstrap": "^5.3.2",
    "bootstrap-icons": "^1.11.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8080"
}
```

---

## 5. Testing Guide

### 5.1 Start Backend

1. Open IntelliJ IDEA
2. Open backend project
3. Find `DemoApplication.java`
4. Right-click → Run
5. Wait for: "Started DemoApplication in X seconds"

---

### 5.2 Test Backend APIs

**Open Command Prompt:**

```cmd
REM Test health
curl http://localhost:8080/api/reports/health

REM Test pending reports
curl http://localhost:8080/api/reports/pending

REM Test sync
curl -X PUT http://localhost:8080/api/reports/1/sync
```

---

### 5.3 Start Frontend

**Open new Command Prompt:**

```cmd
cd C:\Projects\scgbs-frontend

npm start
```

Browser opens at: http://localhost:3000

---

### 5.4 Test Complete Flow

1. ✅ Frontend loads without errors
2. ✅ Shows 2 pending reports
3. ✅ Click [Sync] on first report
4. ✅ File copies to destination
5. ✅ Transfer log appears
6. ✅ Stats update

---

### 5.5 Verify Files Copied

**In File Explorer, check:**

```
C:\Users\YOUR_USERNAME\demo-reports\destination\Finance\
```

Should see: `daily_sales.csv`

---

## 6. Troubleshooting

### Issue 1: PostgreSQL Connection Failed

**Error:** `connection refused`

**Fix:**
```cmd
REM Check if PostgreSQL is running
sc query postgresql

REM If not running, start it
net start postgresql
```

---

### Issue 2: Port 8080 Already in Use

**Error:** `Port 8080 is already in use`

**Fix:**
```cmd
REM Find process using port 8080
netstat -ano | findstr :8080

REM Kill the process (replace PID)
taskkill /PID <PID> /F
```

---

### Issue 3: Frontend Shows No Data

**Fix:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Check browser console (F12) for errors
4. Verify backend is running

---

### Issue 4: Files Not Syncing

**Check:**
1. Source files exist
2. Path in `path_configs` is correct
3. Windows username is correct
4. Backend logs in IntelliJ console

---

### Issue 5: Module Not Found

**Error:** `Cannot find module 'axios'`

**Fix:**
```cmd
cd C:\Projects\scgbs-frontend
npm install
```

---

## 📋 Final Checklist

```
Prerequisites:
✅ PostgreSQL installed
✅ Java 17 installed
✅ Node.js installed
✅ IntelliJ IDEA installed

Database:
✅ myappdb created
✅ All 8 tables created
✅ Test data inserted
✅ path_configs has correct Windows paths

Backend:
✅ Project created in IntelliJ
✅ pom.xml dependencies correct
✅ All entity classes created
✅ All repository classes created
✅ All service classes created
✅ All controller classes created
✅ application.properties configured
✅ Backend starts without errors

Frontend:
✅ React app created
✅ Dependencies installed
✅ .env file created
✅ All components created
✅ Frontend starts without errors

Testing:
✅ Backend health check works
✅ GET /api/reports/pending returns data
✅ Frontend displays pending reports
✅ Sync button works
✅ Files copy to destination
✅ Transfer logs display
```

---

## 🎉 Setup Complete!

Your SCGBS Reports Operations Module is now fully functional!

**Access the application:**
- Backend: http://localhost:8080
- Frontend: http://localhost:3000

**Default credentials:**
- Ops User: ops@scgbs.com

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section
2. Review backend logs in IntelliJ
3. Check browser console (F12)
4. Verify all paths are correct for Windows

---

**Documentation Version:** 1.0  
**Last Updated:** January 2025  
**Platform:** Windows 10/11

---

END OF DOCUMENTATION
