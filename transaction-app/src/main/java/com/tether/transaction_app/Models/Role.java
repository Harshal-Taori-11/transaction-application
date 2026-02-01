package com.tether.transaction_app.Models;

import com.tether.transaction_app.Enums.RoleEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleEnum role;

    @OneToMany(mappedBy = "role")
    private List<User> users;

    // Constructors
    public Role() {}

    public Role(RoleEnum role) {
        this.role = role;
    }
}
