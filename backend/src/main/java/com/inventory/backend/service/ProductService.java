package com.inventory.backend.service;

import com.inventory.backend.model.*;
import com.inventory.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AlertRepository alertRepository;

    public List<Product> getAllProducts(User user) {
        return productRepository.findByUser(user);
    }

    public Product getProductById(Long id, User user) {
        return productRepository.findById(id)
            .filter(p -> p.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(Product product, User user) {
        product.setUser(user);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updated, User user) {
        Product product = getProductById(id, user);
        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setSku(updated.getSku());
        product.setPrice(updated.getPrice());
        product.setReorderLevel(updated.getReorderLevel());
        product.setStatus(updated.getStatus());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public void deleteProduct(Long id, User user) {
        Product product = getProductById(id, user);
        productRepository.delete(product);
    }

    @Transactional
    public Product updateStock(Long id, Integer quantity,
            StockMovement.Type type, String reason, User user) {
        Product product = getProductById(id, user);
        int previousStock = product.getQuantity();
        int newStock;

        if (type == StockMovement.Type.STOCK_IN) {
            newStock = previousStock + quantity;
        } else if (type == StockMovement.Type.STOCK_OUT) {
            if (previousStock < quantity) {
                throw new RuntimeException("Insufficient stock");
            }
            newStock = previousStock - quantity;
        } else {
            newStock = quantity;
        }

        product.setQuantity(newStock);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setUser(user);
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(newStock);
        movement.setReason(reason);
        stockMovementRepository.save(movement);

        if (newStock <= product.getReorderLevel()) {
            Alert alert = new Alert();
            alert.setUser(user);
            alert.setProduct(product);
            alert.setType(newStock == 0 ?
                Alert.Type.OUT_OF_STOCK : Alert.Type.LOW_STOCK);
            alert.setMessage(newStock == 0 ?
                product.getName() + " is out of stock!" :
                product.getName() + " is low on stock! Only " + newStock + " left.");
            alertRepository.save(alert);
        }

        return product;
    }

    public List<Product> getLowStockProducts(User user) {
        return productRepository.findByUser(user).stream()
            .filter(p -> p.getQuantity() <= p.getReorderLevel())
            .toList();
    }
}