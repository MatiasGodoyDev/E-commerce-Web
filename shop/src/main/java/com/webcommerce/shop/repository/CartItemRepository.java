package com.webcommerce.shop.repository;

import com.webcommerce.shop.model.CartItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query(value = "SELECT ci.id AS cart_item_id, ci.cantidad, " +
            "v.id AS variante_id, v.talle, v.color, v.color_hex, v.stock, " +
            "p.id AS producto_id, p.nombre AS producto_nombre, p.precio_base AS producto_precio, " +
            "p.imagen_frente, p.imagen_dorso, p.porcentaje_descuento " +
            "FROM cart_items ci " +
            "JOIN product_variants v ON ci.variante_id = v.id " +
            "JOIN products p ON v.producto_id = p.id " +
            "WHERE ci.carrito_id = :carritoId", nativeQuery = true)
    List<Object[]> findCartItemsDetailsByCarritoId(@Param("carritoId") Long carritoId);

    // 🔥 AGREGAR ESTO: Borrado masivo y directo en SQL por ID de carrito
    @Modifying
    @Query(value = "DELETE FROM cart_items WHERE carrito_id = :carritoId", nativeQuery = true)
    void deleteByCarritoId(@Param("carritoId") Long carritoId);

}