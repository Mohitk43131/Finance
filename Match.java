package com.esports.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "matches")
public class Match {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // In a full implementation, map these using @ManyToOne to the Team entity
    private Long teamAId;
    private Long teamBId;
    private Long winnerId;
    
    private String score;
    private BigDecimal prizeMoney;
    private BigDecimal entryCost;
    private BigDecimal revenueGenerated;
    
    private LocalDate matchDate;
    private LocalTime matchTime;

    // Getters and Setters omitted for brevity
}
