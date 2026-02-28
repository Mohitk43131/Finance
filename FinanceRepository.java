package com.esports.dashboard.repository;

import com.esports.dashboard.model.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface FinanceRepository extends JpaRepository<Finance, Long> {
    @Query("SELECT f FROM Finance f WHERE f.transactionDate >= :startDate")
    List<Finance> findFinancesSinceDate(@Param("startDate") LocalDate startDate);
}
