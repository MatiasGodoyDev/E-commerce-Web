package com.webcommerce.shop.controller;

import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> obtenerFavoritos(@RequestParam Long userId) {
        return ResponseEntity.ok(wishlistService.obtenerFavoritos(userId));
    }

    @PostMapping
    public ResponseEntity<String> agregarAFavoritos(@RequestParam Long userId, @RequestParam Long productoId) {
        wishlistService.agregarA_Favoritos(userId, productoId);
        return ResponseEntity.ok("Producto añadido a favoritos con éxito.");
    }

    @DeleteMapping
    public ResponseEntity<String> quitarDeFavoritos(@RequestParam Long userId, @RequestParam Long productoId) {

        wishlistService.quitarDeFavoritos(userId, productoId);
        return ResponseEntity.ok("Producto eliminado de favoritos.");
    }

    @GetMapping("/count")
    public ResponseEntity<Long> contarFavoritos(@RequestParam Long userId) {
        long total = wishlistService.obtenerFavoritos(userId).size();
        return ResponseEntity.ok(total);
    }
}
