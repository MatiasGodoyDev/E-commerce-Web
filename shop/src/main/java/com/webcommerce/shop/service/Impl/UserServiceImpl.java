package com.webcommerce.shop.service.Impl;

import com.webcommerce.shop.model.User;
import com.webcommerce.shop.enums.Roles;
import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.Wishlist;
import com.webcommerce.shop.repository.UserRepository;
import com.webcommerce.shop.repository.ProductRepository;
import com.webcommerce.shop.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, ProductRepository productRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public User registrarUsuario(User user) {
        if (existsByEmail(user.getEmail())) {
            throw new RuntimeException("El email ya se encuentra registrado.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos.");
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User obtenerPerfilPorId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    }

    @Override
    @Transactional
    public User actualizarPerfil(Long userId, String nombre, String apellido, String passwordNueva) {
        User user = obtenerPerfilPorId(userId);
        user.setNombre(nombre);
        user.setApellido(apellido);
        if (passwordNueva != null && !passwordNueva.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(passwordNueva));
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User actualizarDireccion(Long userId, String calle, String codPostal, String telefono, String piso) {
        User user = obtenerPerfilPorId(userId);
        user.setDireccionCasa(calle);
        user.setCodPostal(codPostal);
        user.setTelefono(telefono);
        user.setPiso(piso);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void agregarAFavoritos(Long userId, Long productoId) {
        User user = obtenerPerfilPorId(userId);
        Product producto = productRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado."));

        boolean yaExiste = user.getWishlistItems().stream()
                .anyMatch(w -> w.getProducto().getId().equals(productoId));

        if (!yaExiste) {
            Wishlist item = new Wishlist();
            item.setUser(user);
            item.setProducto(producto);
            user.getWishlistItems().add(item);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void quitarDeFavoritos(Long userId, Long productoId) {
        User user = obtenerPerfilPorId(userId);
        user.getWishlistItems().removeIf(w -> w.getProducto().getId().equals(productoId));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> obtenerFavoritos(Long userId) {
        User user = obtenerPerfilPorId(userId);
        return user.getWishlistItems().stream()
                .map(Wishlist::getProducto)
                .toList();
    }

    @Override
    public List<User> findByRolIn(List<Roles> roles) {
        return userRepository.findByRolIn(roles);
    }

    @Override
    public List<User> listarPersonalAdmin() {
        List<Roles> rolesPermitidos = Arrays.asList(Roles.ADMINISTRADOR, Roles.EMPLEADO);
        return userRepository.findByRolIn(rolesPermitidos);
    }

    @Override
    public User cambiarRol(Long userId, Roles nuevoRol) {
        User user = obtenerPerfilPorId(userId);
        user.setRol(nuevoRol);
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> listarTodos() {
        return userRepository.findAll();

    }

    @Override
    public Optional<User> buscarPorId(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User actualizarPerfilAdmin(Long id, Map<String, Object> datos) {
        User usuario = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        String nombre = (String) datos.get("nombre");
        String apellido = (String) datos.get("apellido");
        String email = (String) datos.get("email");
        String telefono = (String) datos.get("telefono");
        String passwordActual = (String) datos.get("passwordActual");
        String passwordNueva = (String) datos.get("passwordNueva");

        if (email != null && !email.equals(usuario.getEmail())) {
            Optional<User> usuarioExistente = userRepository.findByEmail(email);
            if (usuarioExistente.isPresent()) {
                throw new RuntimeException("El correo electrónico ya está registrado por otro usuario.");
            }
            usuario.setEmail(email);
        }

        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTelefono(telefono);

        if (passwordNueva != null && !passwordNueva.isEmpty()) {
            if (passwordActual == null || passwordActual.isEmpty()) {
                throw new RuntimeException("Debes ingresar tu contraseña actual para establecer una nueva.");
            }

            if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
                throw new RuntimeException("La contraseña actual es incorrecta.");
            }

            usuario.setPassword(passwordEncoder.encode(passwordNueva));
        }

        return userRepository.save(usuario);
    }
}