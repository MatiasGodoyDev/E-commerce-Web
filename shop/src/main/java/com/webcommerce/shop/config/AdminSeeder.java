package com.webcommerce.shop.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.webcommerce.shop.enums.Roles;             
import com.webcommerce.shop.model.User;               
import com.webcommerce.shop.repository.UserRepository;

@Component 
public class AdminSeeder implements CommandLineRunner {

    @Autowired 
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "lider@webcommerce.com";
        
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            
            admin.setNombre("Líder");
            admin.setApellido("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("AdminPass123!"));
            admin.setRol(Roles.ADMINISTRADOR);
            
            admin.setTelefono("1100000000");
            admin.setDireccionCasa("Av. Central 1234");
            admin.setCodPostal("1000");

            userRepository.save(admin);
            System.out.println("-> Administrador líder inicializado correctamente.");
        }
   // 2. --- USUARIO INVITADO 
        String guestEmail = "invitado@webcommerce.com";
        
        if (userRepository.findByEmail(guestEmail).isEmpty()) {
            User guest = new User();
            
            guest.setNombre("Cliente");
            guest.setApellido("Invitado");
            guest.setEmail(guestEmail);
            guest.setPassword(passwordEncoder.encode("GuestPass123!")); 
            
            guest.setRol(Roles.CLIENTE); // O Roles.INVITADO si lo tienes definido en tu Enum
            
            guest.setTelefono("0000000000");
            guest.setDireccionCasa("Sin dirección");
            guest.setCodPostal("0000");

            userRepository.save(guest);
            System.out.println("-> Usuario Invitado inicializado correctamente en MySQL.");
        }
    }
}