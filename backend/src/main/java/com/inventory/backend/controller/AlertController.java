package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.Alert;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Alert>>> getAllAlerts(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Alerts fetched",
            alertService.getAllAlerts(user)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Alert>>> getUnreadAlerts(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Unread alerts",
            alertService.getUnreadAlerts(user)));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Unread count",
            alertService.getUnreadCount(user)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Alert>> markAsRead(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Alert marked as read",
            alertService.markAsRead(id, user)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication auth) {
        User user = getCurrentUser(auth);
        alertService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All alerts marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        alertService.deleteAlert(id, user);
        return ResponseEntity.ok(ApiResponse.success("Alert deleted"));
    }
}