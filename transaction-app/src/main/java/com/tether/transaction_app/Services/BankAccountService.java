package com.tether.transaction_app.Services;

import com.tether.transaction_app.DTOs.BankAccountRequest;
import com.tether.transaction_app.Enums.AccountType;
import com.tether.transaction_app.Models.BankAccount;
import com.tether.transaction_app.Models.User;
import com.tether.transaction_app.Repository.BankAccountRepository;
import com.tether.transaction_app.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankRepo;
    private final UserRepository userRepo;

    public void addBank(Long userId, BankAccountRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (bankRepo.existsByUserAndAccountNumber(user,request.getAccountNumber()))
            throw new RuntimeException("Account number already exists for user");

        BankAccount bank = BankAccount.builder()
                .accountHolderName(request.getAccountHolderName())
                .accountNumber(request.getAccountNumber())
                .ifscCode(request.getIfscCode())
                .user(user)
                .build();
        bankRepo.save(bank);
    }

    public void deleteBankAccount(Long bankId, User user) {

        Long accountId = Long.valueOf(user.getPrimaryAccountId());
        AccountType accountType = user.getPrimaryAccountType();

        if (accountType == AccountType.BANK && accountId.equals(bankId)){
            throw new RuntimeException("Cannot delete the Primary Account");
        }

        BankAccount account = bankRepo.findById(bankId)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized deletion");
        }

        bankRepo.delete(account);
    }
}
