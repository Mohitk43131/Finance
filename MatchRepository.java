package com.esports.repository;

import com.esports.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    
    // Fetch matches from the last X days
    @Query("SELECT m FROM Match m WHERE m.matchDate >= :startDate")
    List<Match> findMatchesSinceDate(@Param("startDate") LocalDate startDate);
}
