package com.tether.transaction_app.Controller;

import com.tether.transaction_app.DTOs.TransactionOutput;
import com.tether.transaction_app.Models.Transaction;
import com.tether.transaction_app.Services.AppConfigService;
import com.tether.transaction_app.Services.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AppConfigService configService;
    private final TransactionService transactionService;

    @PutMapping("/rate")
    public ResponseEntity<?> updateRate(@RequestParam double rate) {
        configService.setTokenRate(rate);
        return ResponseEntity.ok("Rate updated successfully");
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions(){
        List<TransactionOutput> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/approveBuy/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        transactionService.approveBuyTransaction(id);
        return ResponseEntity.ok("Transaction approved.");
    }

    @PutMapping("/approveSell/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestParam String paymentId) {
        transactionService.approveSellTransaction(id,paymentId);
        return ResponseEntity.ok("Transaction approved.");
    }

    @PutMapping("/fail/{id}")
    public ResponseEntity<?> fail(@PathVariable Long id) {
        transactionService.failTransaction(id);
        return ResponseEntity.ok("Transaction marked as failed.");
    }
}
