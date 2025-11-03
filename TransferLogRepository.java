package com.example.demo.repository;

import com.example.demo.entity.TransferLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferLogRepository extends JpaRepository<TransferLog, Long> {
    long countByStatus(String status);
    List<TransferLog> findByTransferredAtBetween(LocalDateTime start, LocalDateTime end);
}