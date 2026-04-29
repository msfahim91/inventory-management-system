package com.inventory.backend.controller;

import com.inventory.backend.dto.ApiResponse;
import com.inventory.backend.model.Category;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories(
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Categories fetched",
            categoryService.getAllCategories(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategory(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Category fetched",
            categoryService.getCategoryById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @RequestBody Category category, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Category created",
            categoryService.createCategory(category, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(ApiResponse.success("Category updated",
            categoryService.updateCategory(id, category, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        categoryService.deleteCategory(id, user);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }
}