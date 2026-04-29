package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.*;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllOrders(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Orders fetched",
            purchaseOrderService.getAllOrders(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getOrder(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Order fetched",
            purchaseOrderService.getOrderById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrder>> createOrder(
            @RequestBody PurchaseOrder order, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Order created",
            purchaseOrderService.createOrder(order, user)));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<PurchaseOrder>> receiveOrder(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Order received",
            purchaseOrderService.receiveOrder(id, user)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        User user = getCurrentUser(auth);
        PurchaseOrder.Status status = PurchaseOrder.Status
            .valueOf(request.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated",
            purchaseOrderService.updateStatus(id, status, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        purchaseOrderService.deleteOrder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Order deleted"));
    }
}