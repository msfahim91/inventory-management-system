package com.inventory.backend.repository;

import com.inventory.backend.model.Alert;
import com.inventory.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUser(User user);
    List<Alert> findByUserAndIsRead(User user, boolean isRead);
    long countByUserAndIsRead(User user, boolean isRead);
}