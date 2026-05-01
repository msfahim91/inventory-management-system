package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.*;
import com.inventory.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── System Stats ──────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
            adminService.getSystemStats()));
    }

    // ── User Management ───────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
            adminService.getAllUsers()));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User approved",
            adminService.approveUser(id)));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<User>> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User banned",
            adminService.banUser(id)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<User>> createAdmin(
            @RequestBody Map<String, String> request) {
        try {
            User admin = adminService.createAdmin(
                request.get("name"),
                request.get("email"),
                request.get("password")
            );
            return ResponseEntity.ok(ApiResponse.success("Admin created", admin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── All Products ──────────────────────────────
    @GetMapping("/all-products")
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success("All products fetched",
            adminService.getAllProducts()));
    }

    // ── All Orders ────────────────────────────────
    @GetMapping("/all-sales-orders")
    public ResponseEntity<ApiResponse<List<SalesOrder>>> getAllSalesOrders() {
        return ResponseEntity.ok(ApiResponse.success("All sales orders fetched",
            adminService.getAllSalesOrders()));
    }

    @GetMapping("/all-purchase-orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllPurchaseOrders() {
        return ResponseEntity.ok(ApiResponse.success("All purchase orders fetched",
            adminService.getAllPurchaseOrders()));
    }

    // ── All Stock Movements ───────────────────────
    @GetMapping("/all-stock-movements")
    public ResponseEntity<ApiResponse<List<StockMovement>>> getAllStockMovements() {
        return ResponseEntity.ok(ApiResponse.success("All stock movements fetched",
            adminService.getAllStockMovements()));
    }
}