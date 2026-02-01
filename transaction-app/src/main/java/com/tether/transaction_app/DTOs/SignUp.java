package com.tether.transaction_app.DTOs;

import lombok.Data;

@Data
public class SignUp {
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
}
