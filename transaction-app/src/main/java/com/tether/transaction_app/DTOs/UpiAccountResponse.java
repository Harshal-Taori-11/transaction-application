package com.tether.transaction_app.DTOs;

import com.tether.transaction_app.Enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpiAccountResponse {
    private Long id;
    private String upiId;
    private AccountType accountType;
}
