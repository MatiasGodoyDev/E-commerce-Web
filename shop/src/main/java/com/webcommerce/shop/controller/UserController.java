package com.webcommerce.shop.controller;

import com.webcommerce.shop.model.User;
import com.webcommerce.shop.service.UserService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registrarUsuario(@RequestBody User user) {

        return ResponseEntity.ok(userService.registrarUsuario(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {

        User user = userService.login(email, password);

        if (user == null) {
            return ResponseEntity.status(401).body("Credenciales inválidas.");
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId());
        response.put("nombre", user.getNombre());
        response.put("apellido", user.getApellido());
        response.put("email", user.getEmail());
        response.put("telefono", user.getTelefono());
        response.put("piso", user.getPiso());
        response.put("direccionCasa", user.getDireccionCasa());
        response.put("codPostal", user.getCodPostal());
        response.put("rol", user.getRol());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<User> obtenerPerfilPorId(@PathVariable Long id) {

        return ResponseEntity.ok(userService.obtenerPerfilPorId(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> obtenerUsuarioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(userService.obtenerPerfilPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> actualizarPerfilJson(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String nombre = (String) payload.get("nombre");
        String apellido = (String) payload.get("apellido");
        String passwordNueva = (String) payload.get("password");
        return ResponseEntity.ok(userService.actualizarPerfil(id, nombre, apellido, passwordNueva));
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<User> actualizarDireccionJson(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String calle = (String) payload.getOrDefault("direccionCasa", "");
        String piso = (String) payload.getOrDefault("piso", "");
        String codPostal = (String) payload.getOrDefault("codPostal", "");

        return ResponseEntity.ok(userService.actualizarDireccion(id, calle, codPostal, "", piso));
    }

}
