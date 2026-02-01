package com.tether.transaction_app.Configs;

import com.tether.transaction_app.Models.Role;
import com.tether.transaction_app.Enums.RoleEnum;
import com.tether.transaction_app.Repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.findByRole(RoleEnum.ADMIN).isEmpty()) {
            roleRepository.save(new Role(RoleEnum.ADMIN));
        }
        if (roleRepository.findByRole(RoleEnum.USER).isEmpty()) {
            roleRepository.save(new Role(RoleEnum.USER));
        }
    }
}

