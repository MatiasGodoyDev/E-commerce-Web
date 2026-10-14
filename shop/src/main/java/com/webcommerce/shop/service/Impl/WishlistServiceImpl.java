package com.webcommerce.shop.service.Impl;

import com.webcommerce.shop.model.User;
import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.Wishlist;
import com.webcommerce.shop.repository.UserRepository;
import com.webcommerce.shop.repository.WishlistRepository;
import com.webcommerce.shop.repository.ProductRepository;
import com.webcommerce.shop.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;

    public WishlistServiceImpl(UserRepository userRepository,
            ProductRepository productRepository,
            WishlistRepository wishlistRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.wishlistRepository = wishlistRepository;
    }

    @Override
    @Transactional
    public void agregarA_Favoritos(Long userId, Long productoId) {

        boolean yaExiste = wishlistRepository.existsByUserIdAndProductoId(userId, productoId);

        if (!yaExiste) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));

            Product producto = productRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

            Wishlist nuevoFavorito = new Wishlist();
            nuevoFavorito.setUser(user);
            nuevoFavorito.setProducto(producto);

            wishlistRepository.save(nuevoFavorito);
        }
    }

    @Override
    @Transactional
    public void quitarDeFavoritos(Long userId, Long productoId) {

        wishlistRepository.deleteByUserIdAndProductoId(userId, productoId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> obtenerFavoritos(Long userId) {

        return wishlistRepository.findProductsByUserId(userId);
    }
}