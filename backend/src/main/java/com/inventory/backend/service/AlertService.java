package com.inventory.backend.service;

import com.inventory.backend.model.Alert;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public List<Alert> getAllAlerts(User user) {
        return alertRepository.findByUser(user);
    }

    public List<Alert> getUnreadAlerts(User user) {
        return alertRepository.findByUserAndIsRead(user, false);
    }

    public long getUnreadCount(User user) {
        return alertRepository.countByUserAndIsRead(user, false);
    }

    public Alert markAsRead(Long id, User user) {
        Alert alert = alertRepository.findById(id)
            .filter(a -> a.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setRead(true);
        return alertRepository.save(alert);
    }

    public void markAllAsRead(User user) {
        List<Alert> unread = alertRepository
            .findByUserAndIsRead(user, false);
        unread.forEach(a -> a.setRead(true));
        alertRepository.saveAll(unread);
    }

    public void deleteAlert(Long id, User user) {
        Alert alert = alertRepository.findById(id)
            .filter(a -> a.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        alertRepository.delete(alert);
    }
}