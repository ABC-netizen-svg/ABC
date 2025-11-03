package com.example.demo.dto;




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