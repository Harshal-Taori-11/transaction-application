package com.tether.transaction_app.DTOs;

import com.tether.transaction_app.Enums.TransactionStatus;
import com.tether.transaction_app.Enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionOutput {
    private Long id;
    private String paymentId;
    private double amount;
    private double tokens;
    private double rate;
    private TransactionType type; // BUY, SELL
    private TransactionStatus status; // PENDING, COMPLETED, REJECTED
    private LocalDateTime createdAt;
    private Long userId;
}
