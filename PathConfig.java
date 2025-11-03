

package com.example.demo.entity;
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