package com.example.demo.repository;

import com.example.demo.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);
    long countByStatus(String status);
    Optional<Report> findByPathConfigId(Long pathConfigId);

    // ✅ NEW METHOD - Add this line
    List<Report> findByStatusAndCreatedAtAfter(String status, LocalDateTime timestamp);
}