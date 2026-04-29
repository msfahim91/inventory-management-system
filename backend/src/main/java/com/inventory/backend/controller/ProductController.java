package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.*;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Products fetched",
            productService.getAllProducts(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProduct(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Product fetched",
            productService.getProductById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @RequestBody Product product, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Product created",
            productService.createProduct(product, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Product updated",
            productService.updateProduct(id, product, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        productService.deleteProduct(id, user);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    @PostMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<Product>> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        User user = getCurrentUser(auth);
        Integer quantity = (Integer) request.get("quantity");
        StockMovement.Type type = StockMovement.Type
            .valueOf((String) request.get("type"));
        String reason = (String) request.get("reason");
        return ResponseEntity.ok(ApiResponse.success("Stock updated",
            productService.updateStock(id, quantity, type, reason, user)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStock(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Low stock products",
            productService.getLowStockProducts(user)));
    }
}