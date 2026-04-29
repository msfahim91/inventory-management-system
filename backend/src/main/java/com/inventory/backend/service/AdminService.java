package com.inventory.backend.service;

import com.inventory.backend.model.User;
import com.inventory.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User approveUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.ACTIVE);
        return userRepository.save(user);
    }

    public User banUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.BANNED);
        return userRepository.save(user);
    }

    public User pendingUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.PENDING);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getActiveUsers() {
        return userRepository.findAll().stream()
            .filter(u -> u.getStatus() == User.Status.ACTIVE)
            .count();
    }

    public long getPendingUsers() {
        return userRepository.findAll().stream()
            .filter(u -> u.getStatus() == User.Status.PENDING)
            .count();
    }

    public User createAdmin(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(User.Status.ACTIVE);
        return userRepository.save(admin);
    }
}