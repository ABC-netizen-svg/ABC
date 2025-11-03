package com.example.demo.entity;


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