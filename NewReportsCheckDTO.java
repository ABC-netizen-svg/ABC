package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewReportsCheckDTO {
    private boolean hasNew;
    private int count;
    private LocalDateTime latestTimestamp;
    private List<String> reports;
}