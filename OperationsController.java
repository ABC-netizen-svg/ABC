package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Report;
import com.example.demo.repository.ReportRepository;
import com.example.demo.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
public class OperationsController {

    @Autowired
    private OperationsService operationsService;

    @Autowired
    private FileTransferService fileTransferService;

    @Autowired
    private ReportRepository reportRepository;  // ✅ ADD THIS

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

    // ✅ NEW METHOD - Add this entire method
    @GetMapping("/reports/check-new")
    public ResponseEntity<NewReportsCheckDTO> checkNewReports(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime lastCheck) {

        log.info("GET /api/reports/check-new?lastCheck={}", lastCheck);

        try {
            // Default to 1 hour ago if no lastCheck provided
            if (lastCheck == null) {
                lastCheck = LocalDateTime.now().minusHours(1);
            }

            // Get pending reports created after lastCheck
            List<Report> newReports = reportRepository.findByStatusAndCreatedAtAfter(
                    "pending",
                    lastCheck
            );

            // Build response
            NewReportsCheckDTO response = new NewReportsCheckDTO();
            response.setHasNew(!newReports.isEmpty());
            response.setCount(newReports.size());
            response.setLatestTimestamp(LocalDateTime.now());
            response.setReports(
                    newReports.stream()
                            .map(Report::getName)
                            .collect(Collectors.toList())
            );

            log.info("Found {} new reports since {}", newReports.size(), lastCheck);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking new reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}