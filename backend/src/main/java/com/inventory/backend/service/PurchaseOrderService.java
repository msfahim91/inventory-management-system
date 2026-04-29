package com.inventory.backend.service;

import com.inventory.backend.model.*;
import com.inventory.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<PurchaseOrder> getAllOrders(User user) {
        return purchaseOrderRepository.findByUser(user);
    }

    public PurchaseOrder getOrderById(Long id, User user) {
        return purchaseOrderRepository.findById(id)
            .filter(o -> o.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public PurchaseOrder createOrder(PurchaseOrder order, User user) {
        order.setUser(user);
        order.setOrderNumber("PO-" + UUID.randomUUID()
            .toString().substring(0, 8).toUpperCase());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (PurchaseOrderItem item : order.getItems()) {
                item.setPurchaseOrder(order);
                item.setTotalPrice(item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
                total = total.add(item.getTotalPrice());
            }
        }
        order.setTotalAmount(total);
        return purchaseOrderRepository.save(order);
    }

    @Transactional
    public PurchaseOrder receiveOrder(Long id, User user) {
        PurchaseOrder order = getOrderById(id, user);
        if (order.getStatus() != PurchaseOrder.Status.APPROVED) {
            throw new RuntimeException("Order must be approved first");
        }

        for (PurchaseOrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        }

        order.setStatus(PurchaseOrder.Status.RECEIVED);
        order.setUpdatedAt(LocalDateTime.now());
        return purchaseOrderRepository.save(order);
    }

    public PurchaseOrder updateStatus(Long id,
            PurchaseOrder.Status status, User user) {
        PurchaseOrder order = getOrderById(id, user);
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return purchaseOrderRepository.save(order);
    }

    public void deleteOrder(Long id, User user) {
        PurchaseOrder order = getOrderById(id, user);
        if (order.getStatus() != PurchaseOrder.Status.PENDING) {
            throw new RuntimeException("Only pending orders can be deleted");
        }
        purchaseOrderRepository.delete(order);
    }
}