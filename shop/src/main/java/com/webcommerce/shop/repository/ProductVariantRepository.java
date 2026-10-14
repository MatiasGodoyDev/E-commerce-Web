package com.webcommerce.shop.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.webcommerce.shop.enums.CutType;
import com.webcommerce.shop.enums.Talles;
import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.ProductVariant;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductoId(Long productoId);

    List<Product> findByTalle(Talles talle);

    List<Product> findByColor(String color);

    List<Product> findByColorHex(String colorHex);

}
