package com.tether.transaction_app.Repository;

import com.tether.transaction_app.Models.Transaction;
import com.tether.transaction_app.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
}

