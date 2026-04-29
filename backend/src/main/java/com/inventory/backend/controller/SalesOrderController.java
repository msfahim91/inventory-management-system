package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.*;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.SalesOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesOrder>>> getAllOrders(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Orders fetched",
            salesOrderService.getAllOrders(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrder>> getOrder(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Order fetched",
            salesOrderService.getOrderById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesOrder>> createOrder(
            @RequestBody SalesOrder order, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Order created",
            salesOrderService.createOrder(order, user)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SalesOrder>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        User user = getCurrentUser(auth);
        SalesOrder.Status status = SalesOrder.Status
            .valueOf(request.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated",
            salesOrderService.updateStatus(id, status, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        salesOrderService.deleteOrder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Order deleted"));
    }
}