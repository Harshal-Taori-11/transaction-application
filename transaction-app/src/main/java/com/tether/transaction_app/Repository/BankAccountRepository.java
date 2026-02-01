package com.tether.transaction_app.Repository;

import com.tether.transaction_app.Models.BankAccount;
import com.tether.transaction_app.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUser(User user);
    boolean existsByUserAndAccountNumber(User user, String accountNumber);
}