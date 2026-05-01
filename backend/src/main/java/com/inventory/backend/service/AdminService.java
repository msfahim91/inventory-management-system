package com.inventory.backend.service;

import com.inventory.backend.model.*;
import com.inventory.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AlertRepository alertRepository;
    private final PasswordEncoder passwordEncoder;

    // User Management
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User approveUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.ACTIVE);
        return userRepository.save(user);
    }

    public User banUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.BANNED);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    // All Products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // All Orders
    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    // All Stock Movements
    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAll();
    }

    // System Stats
    public java.util.Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
            .filter(u -> u.getStatus() == User.Status.ACTIVE).count();
        long pendingUsers = userRepository.findAll().stream()
            .filter(u -> u.getStatus() == User.Status.PENDING).count();
        long totalProducts = productRepository.count();
        long totalSalesOrders = salesOrderRepository.count();
        long totalPurchaseOrders = purchaseOrderRepository.count();
        long lowStockProducts = productRepository.findAll().stream()
            .filter(p -> p.getQuantity() <= p.getReorderLevel()).count();

        return java.util.Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "pendingUsers", pendingUsers,
            "totalProducts", totalProducts,
            "totalSalesOrders", totalSalesOrders,
            "totalPurchaseOrders", totalPurchaseOrders,
            "lowStockProducts", lowStockProducts
        );
    }

    public User createAdmin(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(User.Status.ACTIVE);
        return userRepository.save(admin);
    }
}