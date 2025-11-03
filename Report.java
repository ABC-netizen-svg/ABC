


package com.example.demo.entity;
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