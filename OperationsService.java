package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;

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

                    // Extract date from report name or use created date
                    dto.setDate(extractDateFromName(report.getName(), report.getCreatedAt()));

                    // Get details from linked path_config if exists
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

    // Helper method to extract date from filename
    private String extractDateFromName(String fileName, LocalDateTime fallbackDate) {
        // Try to extract date from filename pattern like: Customer_2023052701010_1.csv
        // Pattern: YYYYMMDD in the filename
        try {
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
            // If extraction fails, use fallback
        }

        // Fallback to created date
        if (fallbackDate != null) {
            return fallbackDate.toLocalDate().toString();
        }

        return LocalDate.now().toString();
    }
}
