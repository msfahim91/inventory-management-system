package com.inventory.backend.repository;

import com.inventory.backend.model.PurchaseOrder;
import com.inventory.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByUser(User user);
    List<PurchaseOrder> findByUserAndStatus(User user, PurchaseOrder.Status status);
    Optional<PurchaseOrder> findByOrderNumberAndUser(String orderNumber, User user);
}