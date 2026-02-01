package com.tether.transaction_app.Services;

import com.tether.transaction_app.Enums.AccountType;
import com.tether.transaction_app.Enums.RoleEnum;
import com.tether.transaction_app.Exceptions.ResourceNotFoundException;
import com.tether.transaction_app.Repository.BankAccountRepository;
import com.tether.transaction_app.Repository.RoleRepository;
import com.tether.transaction_app.Repository.UpiAccountRepository;
import com.tether.transaction_app.Repository.UserRepository;
import com.tether.transaction_app.Security.JwtTokenHelper;
import com.tether.transaction_app.DTOs.*;
import com.tether.transaction_app.Models.BankAccount;
import com.tether.transaction_app.Models.Role;
import com.tether.transaction_app.Models.UpiAccount;
import com.tether.transaction_app.Models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UpiAccountRepository upiAccountRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenHelper jwtTokenHelper;
    private final RoleRepository roleRepository;

    public AuthResponse signup(SignUp request) {
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new ResourceNotFoundException("Number already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResourceNotFoundException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Role userRole = roleRepository.findByRole(RoleEnum.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        user.setRole(userRole);

        userRepository.save(user);

        String token = jwtTokenHelper.generateToken(user);

        return new AuthResponse("User registered successfully", user.getId(), token);
    }


    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(()-> new ResourceNotFoundException("Number", request.getPhoneNumber()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtTokenHelper.generateToken(user);

        return new AuthResponse("Login successful", user.getId(), token);
    }

    public void setPrimaryAccount(User user,AccountType accountType,String primaryAccountId) {

        Long id = Long.valueOf(primaryAccountId);

        if(accountType == AccountType.BANK){
                bankAccountRepository.findById(id)
                        .filter(acc -> acc.getUser().getId().equals(user.getId()))
                        .orElseThrow(() -> new ResourceNotFoundException("BankId", id));
        }
        else{
            upiAccountRepository.findById(id)
                        .filter(acc -> acc.getUser().getId().equals(user.getId()))
                        .orElseThrow(()-> new ResourceNotFoundException("UPIId", id));
        }

        user.setPrimaryAccountType(accountType);
        user.setPrimaryAccountId(primaryAccountId);
        userRepository.save(user);
    }

    public UserProfileResponse getUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getTokenBalance()
        );
    }

    public UserProfileResponse updateUserProfile(UpdateProfileRequest request,Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getTokenBalance());
    }

    public double getTokenBalance(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserId",id));
        return user.getTokenBalance();
    }

    public Object getPrimaryAccount(User user) {
        if (user.getPrimaryAccountId() == null || user.getPrimaryAccountType() == null) {
            throw new RuntimeException("Primary account is not set for this user");
        }

        Long id = Long.valueOf(user.getPrimaryAccountId());

        if (user.getPrimaryAccountType() == AccountType.UPI) {
            UpiAccount upi = upiAccountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Primary UPI account not found"));

            return new UpiAccountResponse(
                    upi.getId(),
                    upi.getUpiId(),
                    AccountType.UPI); // Example fields
        }

        else if (user.getPrimaryAccountType() == AccountType.BANK) {
            BankAccount bank = bankAccountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Primary bank account not found"));

            return new BankAccountResponse(
                    bank.getId(),
                    bank.getAccountHolderName(),
                    bank.getAccountNumber(),
                    bank.getIfscCode(),
                    AccountType.BANK); // Example fields
        }
        else {
            throw new RuntimeException("Invalid primary account type");
        }
    }

    public List<BankAccountResponse> getAllBankAccounts(User user) {

        List<BankAccount> banks = bankAccountRepository.findByUser(user);

        return banks.stream()
                .map(bank -> new BankAccountResponse(
                        bank.getId(),
                        bank.getAccountHolderName(),
                        bank.getAccountNumber(),
                        bank.getIfscCode(),
                        AccountType.BANK
                ))
                .collect(Collectors.toList());
    }

    public List<UpiAccountResponse> getAllUpiAccounts(User user) {

        List<UpiAccount> upis = upiAccountRepository.findByUser(user);

        return upis.stream()
                .map(upi -> new UpiAccountResponse(
                        upi.getId(),
                        upi.getUpiId(),
                        AccountType.UPI
                ))
                .collect(Collectors.toList());

    }

    public User getUser(Long userId){
        return userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("UserId", userId));
    }
}

