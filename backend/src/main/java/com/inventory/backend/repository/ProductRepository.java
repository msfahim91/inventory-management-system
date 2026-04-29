package com.inventory.backend.repository;

import com.inventory.backend.model.Product;
import com.inventory.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUser(User user);
    List<Product> findByUserAndStatus(User user, Product.Status status);
    Optional<Product> findBySkuAndUser(String sku, User user);
    List<Product> findByUserAndQuantityLessThanEqual(User user, Integer reorderLevel);
}