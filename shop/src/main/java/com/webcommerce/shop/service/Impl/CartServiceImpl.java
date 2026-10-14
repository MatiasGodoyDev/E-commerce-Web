package com.webcommerce.shop.service.Impl;

import com.webcommerce.shop.model.Cart;
import com.webcommerce.shop.model.CartItem;
import com.webcommerce.shop.model.ProductVariant;
import com.webcommerce.shop.model.User;
import com.webcommerce.shop.repository.CartItemRepository;
import com.webcommerce.shop.repository.CartRepository;
import com.webcommerce.shop.repository.ProductVariantRepository;
import com.webcommerce.shop.repository.UserRepository;
import com.webcommerce.shop.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductVariantRepository variantRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> crearNuevoCarrito(userId));
    }

    @Override
    @Transactional
    public void addItemToCart(Long userId, Long varianteId, Integer cantidad) {
        Cart cart = getCartByUserId(userId);

        ProductVariant variante = variantRepository.findById(varianteId)
                .orElseThrow(() -> new RuntimeException("¡Ups! Esa variante de ropa no existe."));

        if (variante.getStock() < cantidad) {
            throw new RuntimeException("No hay stock suficiente. Solo quedan " + variante.getStock() + " unidades.");
        }

        CartItem nuevoItem = new CartItem();
        nuevoItem.setCart(cart);
        nuevoItem.setVariante(variante);
        nuevoItem.setCantidad(cantidad);

        cart.getItems().add(nuevoItem);

        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void updateItemQuantity(Long userId, Long itemId, Integer nuevaCantidad) {
        Cart cart = getCartByUserId(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado en el carrito."));

        if (item.getVariante().getStock() < nuevaCantidad) {
            throw new RuntimeException("No hay stock suficiente para cambiar a esa cantidad.");
        }

        item.setCantidad(nuevaCantidad);
        cartItemRepository.save(item);
    }

    @Override
    @Transactional
    public void removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getCartByUserId(userId);

        cart.getItems().removeIf(item -> item.getId().equals(itemId));

        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) {
            cartItemRepository.deleteAll(cart.getItems());

            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart crearNuevoCarrito(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));

        Cart nuevoCart = new Cart();
        nuevoCart.setUser(user);
        return cartRepository.save(nuevoCart);
    }

    public Cart obtenerCarritoPorUsuario(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    Cart nuevoCart = new Cart();
                    return cartRepository.save(nuevoCart);
                });
    }

    @Override
    public List<Map<String, Object>> obtenerDetallesDelCarrito(Long carritoId) {
        List<Object[]> resultados = cartItemRepository.findCartItemsDetailsByCarritoId(carritoId);
        List<Map<String, Object>> listaCarrito = new ArrayList<>();

        for (Object[] fila : resultados) {
            Map<String, Object> item = new HashMap<>();
            item.put("cartItemId", fila[0]);
            item.put("cantidad", fila[1]);
            item.put("varianteId", fila[2]);
            item.put("talle", fila[3]);
            item.put("color", fila[4]);
            item.put("colorHex", fila[5]);
            item.put("stock", fila[6]);
            item.put("productoId", fila[7]);
            item.put("productoNombre", fila[8]);
            BigDecimal precioBase = (BigDecimal) fila[9];
            item.put("productoPrecio", precioBase);
            item.put("imagenFrente", fila[10]);
            item.put("imagenEspalda", fila[11]);

            BigDecimal porcentajeDescuento = BigDecimal.ZERO;
            if (fila.length > 12 && fila[12] != null) {
                porcentajeDescuento = new BigDecimal(fila[12].toString());
            }

            BigDecimal precioFinal = precioBase;
            if (porcentajeDescuento.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal factor = BigDecimal.valueOf(1 - (porcentajeDescuento.doubleValue() / 100.0));
                precioFinal = precioBase.multiply(factor).setScale(2, RoundingMode.HALF_UP);
            }

            item.put("precioFinal", precioFinal);
            listaCarrito.add(item);
        }

        return listaCarrito;
    }

}
