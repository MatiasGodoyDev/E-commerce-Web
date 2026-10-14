package com.webcommerce.shop.service;

import com.webcommerce.shop.model.Product;
import java.util.List;

public interface WishlistService {

    void agregarA_Favoritos(Long userId, Long productoId);

    void quitarDeFavoritos(Long userId, Long productoId);

    List<Product> obtenerFavoritos(Long userId);
}
