package com.inventory.backend.repository;

import com.inventory.backend.model.SalesOrder;
import com.inventory.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByUser(User user);
    List<SalesOrder> findByUserAndStatus(User user, SalesOrder.Status status);
    Optional<SalesOrder> findByOrderNumberAndUser(String orderNumber, User user);
}