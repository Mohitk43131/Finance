package com.esports.dashboard.service;

import com.esports.dashboard.model.Finance;
import com.esports.dashboard.model.TransactionType;
import com.esports.dashboard.repository.FinanceRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    private final FinanceRepository financeRepository;

    public DashboardService(FinanceRepository financeRepository) {
        this.financeRepository = financeRepository;
    }

    public Map<String, Object> getDashboardStats(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Finance> finances = financeRepository.findFinancesSinceDate(startDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Finance f : finances) {
            if (f.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(f.getAmount());
            } else {
                totalExpense = totalExpense.add(f.getAmount());
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalIncome);
        stats.put("totalExpense", totalExpense);
        stats.put("netProfit", totalIncome.subtract(totalExpense));
        return stats;
    }
}
