package com.tether.transaction_app.Controller;

import com.tether.transaction_app.DTOs.BankAccountRequest;
import com.tether.transaction_app.DTOs.BankAccountResponse;
import com.tether.transaction_app.DTOs.UpiAccountRequest;
import com.tether.transaction_app.DTOs.UpiAccountResponse;
import com.tether.transaction_app.Enums.AccountType;
import com.tether.transaction_app.Models.BankAccount;
import com.tether.transaction_app.Models.UpiAccount;
import com.tether.transaction_app.Services.BankAccountService;
import com.tether.transaction_app.Services.UpiAccountService;
import com.tether.transaction_app.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final UserService userService;
    private final UpiAccountService upiAccountService;
    private final BankAccountService bankAccountService;

    @PostMapping("/upi/{userId}")
    public ResponseEntity<?> addUpi(@PathVariable Long userId, @RequestBody UpiAccountRequest request) {
        upiAccountService.addUpi(userId, request);
        return ResponseEntity.ok("UPI added");
    }

    @PostMapping("/bank/{userId}")
    public ResponseEntity<?> addBank(@PathVariable Long userId, @RequestBody BankAccountRequest request) {
        bankAccountService.addBank(userId, request);
        return ResponseEntity.ok("Bank account added");
    }

    @DeleteMapping("/upi/{upiId}/{userId}")
    public ResponseEntity<?> deleteUpi(@PathVariable Long upiId,@PathVariable Long userId) {
        upiAccountService.deleteUpiAccount(upiId , userService.getUser(userId));
        return ResponseEntity.ok("UPI deleted");
    }

    @DeleteMapping("/bank/{bankId}/{userId}")
    public ResponseEntity<?> deleteBank(@PathVariable Long bankId,@PathVariable Long userId) {
        bankAccountService.deleteBankAccount(bankId, userService.getUser(userId));
        return ResponseEntity.ok("Bank account deleted");
    }

    @PutMapping("/set-primary/{userId}")
    public ResponseEntity<String> setPrimary(@RequestParam String primaryId, @RequestParam AccountType accountType, @PathVariable Long userId) {
        userService.setPrimaryAccount(userService.getUser(userId), accountType, primaryId);
        return ResponseEntity.ok("Primary account set to " + primaryId);
    }

    @GetMapping("/primary/{userId}")
    public ResponseEntity<?> getPrimary(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getPrimaryAccount(userService.getUser(userId)));
    }

    @GetMapping("/banks/{userId}")
    public ResponseEntity<List<BankAccountResponse>> getAllBanks(@PathVariable Long userId){
        return ResponseEntity.ok(userService.getAllBankAccounts(userService.getUser(userId)));
    }

    @GetMapping("/upi/{userId}")
    public ResponseEntity<List<UpiAccountResponse>> getAllUpi(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getAllUpiAccounts(userService.getUser(userId)));
    }
}
