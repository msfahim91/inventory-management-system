package com.inventory.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String address;
    private String contactPerson;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        ACTIVE, INACTIVE
    }
}