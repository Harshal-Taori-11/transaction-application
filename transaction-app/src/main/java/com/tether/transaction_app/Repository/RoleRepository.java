package com.tether.transaction_app.Repository;

import com.tether.transaction_app.Models.Role;
import com.tether.transaction_app.Enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRole(RoleEnum role);
}
