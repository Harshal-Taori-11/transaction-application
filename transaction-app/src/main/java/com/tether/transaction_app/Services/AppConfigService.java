package com.tether.transaction_app.Services;

import com.tether.transaction_app.Models.AppConfig;
import com.tether.transaction_app.Exceptions.ResourceNotFoundException;
import com.tether.transaction_app.Repository.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AppConfigService {

    @Autowired
    private AppConfigRepository configRepo;

    public double getTokenRate() {
        AppConfig config = configRepo.findByKey("token_rate")
                .orElseThrow(() -> new ResourceNotFoundException("Rate not configured"));
        return Double.parseDouble(config.getValue());
    }

    public void setTokenRate(double rate) {
        AppConfig config = new AppConfig();
        config.setKey("token_rate");
        config.setValue(String.valueOf(rate));
        config.setUpdatedAt(LocalDateTime.now());
        configRepo.save(config);
    }
}
