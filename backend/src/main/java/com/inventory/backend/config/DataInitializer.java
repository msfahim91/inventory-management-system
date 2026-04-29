package com.inventory.backend.config;

import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (!userRepository.existsByEmail("admin@inventory.com")) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@inventory.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(User.Role.ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                userRepository.save(admin);
                System.out.println("✅ Admin account created!");
                System.out.println("📧 Email: admin@inventory.com");
                System.out.println("🔑 Password: admin123");
            }
        };
    }
}