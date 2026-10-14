package com.webcommerce.shop.controller;

import com.webcommerce.shop.enums.Roles;
import com.webcommerce.shop.model.User;
import com.webcommerce.shop.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminController {

    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public AdminController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<User> crearUsuario(@RequestBody User nuevoUsuario) {
        User usuarioCreado = userService.registrarUsuario(nuevoUsuario);
        return ResponseEntity.ok(usuarioCreado);
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<User> cambiarRol(
            @PathVariable Long id,
            @RequestParam Roles nuevoRol) {
        return ResponseEntity.ok(userService.cambiarRol(id, nuevoRol));
    }

    @GetMapping
    public ResponseEntity<List<User>> listarUsuarios() {
        return ResponseEntity.ok(userService.listarPersonalAdmin());
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userService.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                if (user.getRol() == Roles.ADMINISTRADOR || user.getRol() == Roles.EMPLEADO) {
                    return ResponseEntity.ok(Map.of(
                            "id", user.getId(),
                            "nombre", user.getNombre(),
                            "apellido", user.getApellido() != null ? user.getApellido() : "",
                            "email", user.getEmail(),
                            "telefono", user.getTelefono() != null ? user.getTelefono() : "", // <--- NUEVO: Enviamos el
                                                                                              // teléfono al frontend
                            "rol", user.getRol().name()));
                } else {
                    return ResponseEntity.status(403).body("Acceso denegado: No tienes permisos de administración.");
                }
            }
        }

        return ResponseEntity.status(401).body("Credenciales incorrectas.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPerfilAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, Object> datosActualizados) {
        try {
            User usuarioActualizado = userService.actualizarPerfilAdmin(id, datosActualizados);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}