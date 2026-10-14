package com.webcommerce.shop.repository;

import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    boolean existsByUserIdAndProductoId(Long userId, Long productoId);

    void deleteByUserIdAndProductoId(Long userId, Long productoId);

    @Query("SELECT w.producto FROM Wishlist w WHERE w.user.id = :userId")
    List<Product> findProductsByUserId(@Param("userId") Long userId);
}