package com.webcommerce.shop.service;

import java.util.List;
import java.util.Map;

import com.webcommerce.shop.model.Cart;

public interface CartService {

    Cart getCartByUserId(Long userId);

    void addItemToCart(Long userId, Long varianteId, Integer cantidad);

    void updateItemQuantity(Long userId, Long itemId, Integer nuevaCantidad);

    void removeItemFromCart(Long userId, Long itemId);

    void clearCart(Long userId);

    List<Map<String, Object>> obtenerDetallesDelCarrito(Long carritoId);

}
