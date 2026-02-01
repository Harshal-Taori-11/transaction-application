package com.tether.transaction_app.DTOs;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
}

