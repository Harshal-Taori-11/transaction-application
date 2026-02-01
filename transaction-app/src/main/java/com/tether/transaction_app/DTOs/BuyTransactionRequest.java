package com.tether.transaction_app.DTOs;

import lombok.Data;

@Data
public class BuyTransactionRequest {
    private String paymentId;
    private Double amount;
    private Double rate;
}