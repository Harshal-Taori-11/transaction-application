package com.tether.transaction_app.Repository;

import com.tether.transaction_app.Models.UpiAccount;
import com.tether.transaction_app.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UpiAccountRepository extends JpaRepository<UpiAccount, Long> {
    List<UpiAccount> findByUser(User user);
    boolean existsByUserAndUpiId(User user, String upiId);
}
