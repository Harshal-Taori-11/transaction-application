package com.tether.transaction_app.Controller;

import com.tether.transaction_app.DTOs.BuyTransactionRequest;
import com.tether.transaction_app.DTOs.SellTransactionRequest;
import com.tether.transaction_app.DTOs.TransactionOutput;
import com.tether.transaction_app.Services.TransactionService;
import com.tether.transaction_app.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @PostMapping("/buy/{id}")
    public ResponseEntity<?> buy(@PathVariable Long id, @RequestBody BuyTransactionRequest dto) {
        transactionService.createBuyTransaction(id, dto);
        return ResponseEntity.ok("Buy transaction initiated.");
    }

    @PostMapping("/sell/{id}")
    public ResponseEntity<?> sell(@PathVariable Long id, @RequestBody SellTransactionRequest dto) {
        transactionService.createSellTransaction(id, dto);
        return ResponseEntity.ok("Sell transaction initiated.");
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<TransactionOutput>> getUserTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getUserTransactions(userService.getUser(id)));
    }
}
