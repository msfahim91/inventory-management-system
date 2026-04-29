package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.User;
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

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
            adminService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched",
            adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User approved",
            adminService.approveUser(id)));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<User>> banUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User banned",
            adminService.banUser(id)));
    }

    @PutMapping("/users/{id}/pending")
    public ResponseEntity<ApiResponse<User>> pendingUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User set to pending",
            adminService.pendingUser(id)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        Map<String, Long> stats = Map.of(
            "totalUsers", adminService.getTotalUsers(),
            "activeUsers", adminService.getActiveUsers(),
            "pendingUsers", adminService.getPendingUsers()
        );
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
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
}