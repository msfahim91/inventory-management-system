package com.inventory.backend.service;

import com.inventory.backend.dto.AuthRequest;
import com.inventory.backend.dto.AuthResponse;
import com.inventory.backend.dto.RegisterRequest;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import com.inventory.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBusinessName(request.getBusinessName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.USER);
        user.setStatus(User.Status.PENDING);

        userRepository.save(user);

        return new AuthResponse(
            null,
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getStatus().name()
        );
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getStatus() == User.Status.PENDING) {
            throw new RuntimeException("Account pending approval");
        }

        if (user.getStatus() == User.Status.BANNED) {
            throw new RuntimeException("Account has been banned");
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
            token,
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getStatus().name()
        );
    }
}