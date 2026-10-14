package com.webcommerce.shop.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.webcommerce.shop.enums.EtiquetaDestacada;
import com.webcommerce.shop.enums.Gender;
import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.ProductVariant;

public interface ProductService {

    List<Product> getAllProducts();

    Product getProductById(Long id);

    List<Product> getOfertas();

    List<Product> getNovedades();

    List<Product> getModa();

    List<Product> getUnicos();

    List<Product> getPersonalizado();

    List<Product> searchProductsByNombre(String nombre);

    List<Product> getProductsByCategoria(String categoria);

    List<Product> getProductByGenero(Gender gender);

    List<ProductVariant> getVariantsByProductId(Long productId);

    Product createProduct(Product product);

    Product createProductWithImages(Product product, MultipartFile imagenFrente, MultipartFile imagenEspalda);

    ProductVariant addVariantToProduct(Long productId, ProductVariant variant);

    List<Product> getProductsByEtiqueta(EtiquetaDestacada etiqueta);
}
