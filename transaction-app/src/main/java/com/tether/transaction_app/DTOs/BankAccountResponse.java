package com.tether.transaction_app.DTOs;

import com.tether.transaction_app.Enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BankAccountResponse {
    private Long id;
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private AccountType accountType;
}
