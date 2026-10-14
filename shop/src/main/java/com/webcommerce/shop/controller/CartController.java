package com.webcommerce.shop.controller;

import com.webcommerce.shop.model.Cart;
import com.webcommerce.shop.service.CartService;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart") 
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

     @GetMapping
    public ResponseEntity<Cart> getCartByUserId(@RequestParam Long userId) {
        // Trae el carrito completo con sus ítems y calcula el total general
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<String> addItemToCart(
            @RequestParam Long userId,
            @RequestParam Long varianteId,
            @RequestParam Integer cantidad) {
        // Valida stock en el depósito antes de meter la remera
        cartService.addItemToCart(userId, varianteId, cantidad);
        return ResponseEntity.ok("Producto agregado al carrito con éxito.");
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<String> updateItemQuantity(
            @RequestParam Long userId,
            @PathVariable Long itemId,
            @RequestParam Integer nuevaCantidad) {
        cartService.updateItemQuantity(userId, itemId, nuevaCantidad);
        return ResponseEntity.ok("Cantidad actualizada correctamente.");
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<String> removeItemFromCart(
            @RequestParam Long userId,
            @PathVariable Long itemId) {
        // Borra la fila del producto cuando tocan el tachito de basura
        cartService.removeItemFromCart(userId, itemId);
        return ResponseEntity.ok("Producto eliminado del carrito.");
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<String> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Carrito vaciado por completo.");
    }

    @GetMapping("/items/{carritoId}")
    public ResponseEntity<List<Map<String, Object>>> verCarrito(@PathVariable Long carritoId) {
        List<Map<String, Object>> detalles = cartService.obtenerDetallesDelCarrito(carritoId);
        return ResponseEntity.ok(detalles);
    }

    
}
