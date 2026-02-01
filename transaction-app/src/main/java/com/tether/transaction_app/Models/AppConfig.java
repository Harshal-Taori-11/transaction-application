package com.tether.transaction_app.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "app_config")
public class AppConfig {

    @Id
    @Column(name = "config_key")
    private String key;  // e.g., "token_rate"

    @Column(name = "config_value")
    private String value;  // e.g., "84.5"

    private LocalDateTime updatedAt;
}
