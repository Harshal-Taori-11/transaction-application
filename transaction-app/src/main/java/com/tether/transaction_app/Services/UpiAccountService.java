package com.tether.transaction_app.Services;

import com.tether.transaction_app.DTOs.UpiAccountRequest;
import com.tether.transaction_app.Enums.AccountType;
import com.tether.transaction_app.Models.UpiAccount;
import com.tether.transaction_app.Models.User;
import com.tether.transaction_app.Repository.UpiAccountRepository;
import com.tether.transaction_app.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpiAccountService {

    private final UpiAccountRepository upiRepo;
    private final UserRepository userRepo;

    public void addUpi(Long userId, UpiAccountRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (upiRepo.existsByUserAndUpiId(user,request.getUpiId()))
            throw new RuntimeException("UPI already exists for user");

        UpiAccount upi = UpiAccount.builder()
                .upiId(request.getUpiId())
                .user(user)
                .build();

        upiRepo.save(upi);
    }

    public void deleteUpiAccount(Long upiId, User user) {

        Long accountId = Long.valueOf(user.getPrimaryAccountId());
        AccountType accountType = user.getPrimaryAccountType();

        if (accountType == AccountType.UPI && accountId.equals(upiId)){
            throw new RuntimeException("Cannot delete the Primary Account");
        }

        UpiAccount account = upiRepo.findById(upiId)
                .orElseThrow(() -> new RuntimeException("UPI account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized deletion");
        }

        upiRepo.delete(account);
    }
}