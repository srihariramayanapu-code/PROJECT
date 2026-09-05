package com.example.studentmanagement.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.studentmanagement.entity.Admin;
import com.example.studentmanagement.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public boolean login(String username, String password) {

        Optional<Admin> admin =
                adminRepository.findByUsername(username);

        if (admin.isPresent()) {

            return passwordEncoder.matches(
                    password,
                    admin.get().getPassword()
            );
        }

        return false;
    }

    public Admin createAdmin(Admin admin) {

        String encodedPassword =
                passwordEncoder.encode(admin.getPassword());

        admin.setPassword(encodedPassword);

        return adminRepository.save(admin);
    }
}