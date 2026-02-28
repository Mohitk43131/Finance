package com.esports.dashboard.controller;

import com.esports.dashboard.model.Finance;
import com.esports.dashboard.repository.FinanceRepository;
import com.esports.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FinanceController {
    private final FinanceRepository financeRepository;
    private final DashboardService dashboardService;

    public FinanceController(FinanceRepository financeRepository, DashboardService dashboardService) {
        this.financeRepository = financeRepository;
        this.dashboardService = dashboardService;
    }

    @PostMapping("/finance/add")
    public ResponseEntity<Finance> addTransaction(@RequestBody Finance finance) {
        return ResponseEntity.ok(financeRepository.save(finance));
    }

    @GetMapping("/dashboard/stats")
    public Map<String, Object> getStats(@RequestParam(defaultValue = "30") int days) {
        return dashboardService.getDashboardStats(days);
    }
    
    // New endpoint to power the charts
    @GetMapping("/finance/all")
    public List<Finance> getAllTransactions() {
        return financeRepository.findAll();
    }
}
