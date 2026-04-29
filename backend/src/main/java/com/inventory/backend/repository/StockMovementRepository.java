package com.inventory.backend.repository;

import com.inventory.backend.model.StockMovement;
import com.inventory.backend.model.User;
import com.inventory.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByUser(User user);
    List<StockMovement> findByUserAndProduct(User user, Product product);
    List<StockMovement> findByUserOrderByCreatedAtDesc(User user);
}