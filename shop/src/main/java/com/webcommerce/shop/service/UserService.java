package com.webcommerce.shop.service;

import com.webcommerce.shop.model.User;
import com.webcommerce.shop.enums.Roles;
import com.webcommerce.shop.model.Product;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {

    User registrarUsuario(User user);

    User login(String email, String password);

    User obtenerPerfilPorId(Long userId);

    User actualizarPerfil(Long userId, String nombre, String apellido, String passwordNueva);

    User actualizarDireccion(Long userId, String calle, String codPostal, String telefono, String piso);

    void agregarAFavoritos(Long userId, Long productoId);

    void quitarDeFavoritos(Long userId, Long productoId);

    List<Product> obtenerFavoritos(Long userId);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    User cambiarRol(Long userId, Roles nuevoRol);

    List<User> listarTodos();

    List<User> findByRolIn(List<Roles> roles);

    List<User> listarPersonalAdmin();

    Optional<User> buscarPorId(Long id);

    User actualizarPerfilAdmin(Long id, Map<String, Object> datos);
}
