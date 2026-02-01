package com.tether.transaction_app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Double token;
}
