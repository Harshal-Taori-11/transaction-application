package com.tether.transaction_app.Repository;

import com.tether.transaction_app.Models.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppConfigRepository extends JpaRepository<AppConfig, String> {
    Optional<AppConfig> findByKey(String key);
}

