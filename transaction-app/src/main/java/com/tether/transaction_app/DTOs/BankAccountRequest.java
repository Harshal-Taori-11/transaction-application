package com.tether.transaction_app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class BankAccountRequest {
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
}