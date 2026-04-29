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
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AlertRepository alertRepository;

    public List<SalesOrder> getAllOrders(User user) {
        return salesOrderRepository.findByUser(user);
    }

    public SalesOrder getOrderById(Long id, User user) {
        return salesOrderRepository.findById(id)
            .filter(o -> o.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public SalesOrder createOrder(SalesOrder order, User user) {
        order.setUser(user);
        order.setOrderNumber("SO-" + UUID.randomUUID()
            .toString().substring(0, 8).toUpperCase());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (SalesOrderItem item : order.getItems()) {
                Product product = productRepository.findById(
                    item.getProduct().getId())
                    .orElseThrow(() ->
                        new RuntimeException("Product not found"));

                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException(
                        "Insufficient stock for: " + product.getName());
                }

                item.setSalesOrder(order);
                item.setTotalPrice(item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
                total = total.add(item.getTotalPrice());

                int newStock = product.getQuantity() - item.getQuantity();
                product.setQuantity(newStock);
                product.setUpdatedAt(LocalDateTime.now());
                productRepository.save(product);

                StockMovement movement = new StockMovement();
                movement.setUser(user);
                movement.setProduct(product);
                movement.setType(StockMovement.Type.STOCK_OUT);
                movement.setQuantity(item.getQuantity());
                movement.setPreviousStock(product.getQuantity()
                    + item.getQuantity());
                movement.setNewStock(newStock);
                movement.setReason("Sales Order: " + order.getOrderNumber());
                stockMovementRepository.save(movement);

                if (newStock <= product.getReorderLevel()) {
                    Alert alert = new Alert();
                    alert.setUser(user);
                    alert.setProduct(product);
                    alert.setType(newStock == 0 ?
                        Alert.Type.OUT_OF_STOCK : Alert.Type.LOW_STOCK);
                    alert.setMessage(newStock == 0 ?
                        product.getName() + " is out of stock!" :
                        product.getName() + " is low! Only "
                            + newStock + " left.");
                    alertRepository.save(alert);
                }
            }
        }

        order.setTotalAmount(total);
        return salesOrderRepository.save(order);
    }

    public SalesOrder updateStatus(Long id,
            SalesOrder.Status status, User user) {
        SalesOrder order = getOrderById(id, user);
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return salesOrderRepository.save(order);
    }

    public void deleteOrder(Long id, User user) {
        SalesOrder order = getOrderById(id, user);
        if (order.getStatus() != SalesOrder.Status.PENDING) {
            throw new RuntimeException("Only pending orders can be deleted");
        }
        salesOrderRepository.delete(order);
    }
}