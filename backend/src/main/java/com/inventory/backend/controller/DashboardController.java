package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AlertRepository alertRepository;
    private final StockMovementRepository stockMovementRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            Authentication auth) {
        User user = getCurrentUser(auth);

        long totalProducts = productRepository.findByUser(user).size();

        long lowStockProducts = productRepository.findByUser(user)
            .stream()
            .filter(p -> p.getQuantity() <= p.getReorderLevel())
            .count();

        long totalSalesOrders = salesOrderRepository.findByUser(user).size();

        long totalPurchaseOrders = purchaseOrderRepository
            .findByUser(user).size();

        long unreadAlerts = alertRepository
            .countByUserAndIsRead(user, false);

        long recentMovements = stockMovementRepository
            .findByUserOrderByCreatedAtDesc(user)
            .stream().limit(5).count();

        Map<String, Object> stats = Map.of(
            "totalProducts", totalProducts,
            "lowStockProducts", lowStockProducts,
            "totalSalesOrders", totalSalesOrders,
            "totalPurchaseOrders", totalPurchaseOrders,
            "unreadAlerts", unreadAlerts,
            "recentMovements", recentMovements
        );

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<ApiResponse<Object>> getRecentActivities(
            Authentication auth) {
        User user = getCurrentUser(auth);

        var recentMovements = stockMovementRepository
            .findByUserOrderByCreatedAtDesc(user)
            .stream().limit(10).toList();

        return ResponseEntity.ok(ApiResponse.success(
            "Recent activities", recentMovements));
    }
}