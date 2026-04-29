package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.Supplier;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Suppliers fetched",
            supplierService.getAllSuppliers(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> getSupplier(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Supplier fetched",
            supplierService.getSupplierById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(
            @RequestBody Supplier supplier, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Supplier created",
            supplierService.createSupplier(supplier, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @PathVariable Long id,
            @RequestBody Supplier supplier,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Supplier updated",
            supplierService.updateSupplier(id, supplier, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        supplierService.deleteSupplier(id, user);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted"));
    }
}