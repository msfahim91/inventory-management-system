package com.inventory.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false)
    private Integer quantity;

    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private String reference;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        STOCK_IN, STOCK_OUT, ADJUSTMENT
    }
}