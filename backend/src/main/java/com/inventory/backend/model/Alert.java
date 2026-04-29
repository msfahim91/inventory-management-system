package com.inventory.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private Type type = Type.LOW_STOCK;

    private boolean isRead = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        LOW_STOCK, OUT_OF_STOCK, EXPIRY
    }
}