package com.example.demo.dto;

import com.example.demo.entity.TransferLog;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransferLogDTO {
    private Long id;
    private String reportName;  // Your frontend expects this
    private String reportDate;  // Your frontend expects this
    private String status;
    private String folder;
    private String errorMessage;
    private LocalDateTime transferredAt;
}