package com.tether.transaction_app.Services;

import com.tether.transaction_app.DTOs.BankAccountRequest;
import com.tether.transaction_app.DTOs.BuyTransactionRequest;
import com.tether.transaction_app.DTOs.SellTransactionRequest;
import com.tether.transaction_app.DTOs.TransactionOutput;
import com.tether.transaction_app.Models.Transaction;
import com.tether.transaction_app.Models.User;
import com.tether.transaction_app.Enums.TransactionStatus;
import com.tether.transaction_app.Enums.TransactionType;
import com.tether.transaction_app.Repository.AppConfigRepository;
import com.tether.transaction_app.Repository.TransactionRepository;
import com.tether.transaction_app.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final AppConfigService configService;

    public void createBuyTransaction(Long userId, BuyTransactionRequest dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double tokens = dto.getAmount() / dto.getRate();

        Transaction txn = new Transaction();
        txn.setUuid(UUID.randomUUID().toString());
        txn.setPaymentId(dto.getPaymentId());
        txn.setUser(user);
        txn.setAmount(dto.getAmount());
        txn.setTokens(tokens);
        txn.setRate(dto.getRate());
        txn.setType(TransactionType.BUY);
        txn.setStatus(TransactionStatus.PENDING);
        txn.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(txn);
    }

    public void createSellTransaction(Long userId, SellTransactionRequest dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getPrimaryAccountId() == null){
            throw new RuntimeException("No Primary account");
        }

        if (user.getTokenBalance() < dto.getTokens()) {
            throw new RuntimeException("Insufficient tokens");
        }

        double rate = configService.getTokenRate();

        double amount = dto.getTokens() * rate;

        Transaction tx = new Transaction();
        tx.setUuid(UUID.randomUUID().toString());
        tx.setUser(user);
        tx.setAmount(amount);
        tx.setRate(rate);
        tx.setTokens(dto.getTokens());
        tx.setStatus(TransactionStatus.PENDING);
        tx.setType(TransactionType.SELL);
        tx.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(tx);

        user.setTokenBalance(user.getTokenBalance() - dto.getTokens());
        userRepo.save(user);
    }

    // For Buy Transactions
    public void approveBuyTransaction(Long id) {
        Transaction tx = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction already handled");
        }

        if (tx.getType() != TransactionType.BUY) {
            throw new RuntimeException("This is not a BUY transaction");
        }

        User user = tx.getUser();
        user.setTokenBalance(user.getTokenBalance() + tx.getTokens());
        userRepo.save(user);

        tx.setStatus(TransactionStatus.COMPLETED);
        transactionRepo.save(tx);
    }

    public void approveSellTransaction(Long id, String paymentId) {

        Transaction tx = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction already handled");
        }

        if (tx.getType() != TransactionType.SELL) {
            throw new RuntimeException("This is not a SELL transaction");
        }

        tx.setPaymentId(paymentId);
        tx.setStatus(TransactionStatus.COMPLETED);
        transactionRepo.save(tx);
    }



    public void failTransaction(Long Id) {
        Transaction txn = transactionRepo.findById(Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (txn.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction already processed");
        }

        txn.setStatus(TransactionStatus.FAILED);
        transactionRepo.save(txn);

        if (txn.getType() == TransactionType.SELL) {
            // Refund tokens
            User user = txn.getUser();
            user.setTokenBalance(user.getTokenBalance() + txn.getTokens());
            userRepo.save(user);
        }
    }

    public List<TransactionOutput> getUserTransactions(User user) {
        List<Transaction> txns = transactionRepo.findByUser(user);

        return txns.stream()
                .map(txn -> new TransactionOutput(
                        txn.getId(),
                        txn.getPaymentId(),
                        txn.getAmount(),
                        txn.getTokens(),
                        txn.getRate(),
                        txn.getType(),
                        txn.getStatus(),
                        txn.getCreatedAt(),
                        txn.getUser().getId()
                ))
                .collect(Collectors.toList());
    }

    public List<TransactionOutput> getAllTransactions() {
        List<Transaction> txns = transactionRepo.findAll();;

        return txns.stream()
                .map(txn -> new TransactionOutput(
                        txn.getId(),
                        txn.getPaymentId(),
                        txn.getAmount(),
                        txn.getTokens(),
                        txn.getRate(),
                        txn.getType(),
                        txn.getStatus(),
                        txn.getCreatedAt(),
                        txn.getUser().getId()
                ))
                .collect(Collectors.toList());
    }
}
