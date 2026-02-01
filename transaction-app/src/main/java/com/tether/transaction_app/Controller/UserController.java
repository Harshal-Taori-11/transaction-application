package com.tether.transaction_app.Controller;

import com.tether.transaction_app.DTOs.UpdateProfileRequest;
import com.tether.transaction_app.DTOs.UserProfileResponse;
import com.tether.transaction_app.Services.AppConfigService;
import com.tether.transaction_app.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AppConfigService configService;

    @GetMapping("/{id}/tokens")
    public ResponseEntity<?> getTokens(@PathVariable Long id) {
        double balance = userService.getTokenBalance(id);
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/rate")
    public ResponseEntity<Double> getRate() {
        return ResponseEntity.ok(configService.getTokenRate());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@RequestParam Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateUserProfile(@RequestBody UpdateProfileRequest request,
                                                                 @RequestParam Long userId) {
        UserProfileResponse upr = userService.updateUserProfile(request, userId);
        return ResponseEntity.ok(upr);
    }

}
