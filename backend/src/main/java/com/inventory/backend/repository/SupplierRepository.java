package com.inventory.backend.repository;

import com.inventory.backend.model.Supplier;
import com.inventory.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByUser(User user);
    List<Supplier> findByUserAndStatus(User user, Supplier.Status status);
}