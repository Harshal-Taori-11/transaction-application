package com.tether.transaction_app.Models;

import com.tether.transaction_app.Enums.TransactionStatus;
import com.tether.transaction_app.Enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    private String paymentId;

    @ManyToOne
    private User user;

    private double amount;
    private double tokens;
    private double rate;

    @Enumerated(EnumType.STRING)
    private TransactionType type; // BUY, SELL

    @Enumerated(EnumType.STRING)
    private TransactionStatus status; // PENDING, COMPLETED, REJECTED

    private LocalDateTime createdAt;
}


