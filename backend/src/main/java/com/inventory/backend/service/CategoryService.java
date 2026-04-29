package com.inventory.backend.service;

import com.inventory.backend.model.Category;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories(User user) {
        return categoryRepository.findByUser(user);
    }

    public Category getCategoryById(Long id, User user) {
        return categoryRepository.findById(id)
            .filter(c -> c.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category createCategory(Category category, User user) {
        if (categoryRepository.existsByNameAndUser(category.getName(), user)) {
            throw new RuntimeException("Category already exists");
        }
        category.setUser(user);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updated, User user) {
        Category category = getCategoryById(id, user);
        category.setName(updated.getName());
        category.setDescription(updated.getDescription());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id, User user) {
        Category category = getCategoryById(id, user);
        categoryRepository.delete(category);
    }
}