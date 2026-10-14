package com.webcommerce.shop.controller;

import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.ProductVariant;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webcommerce.shop.enums.EtiquetaDestacada;
import com.webcommerce.shop.enums.Gender;
import com.webcommerce.shop.service.ProductService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/ofertas")
    public ResponseEntity<List<Product>> getOfertas() {
        return ResponseEntity.ok(productService.getOfertas());
    }

    @GetMapping("/index")
    public ResponseEntity<List<Product>> getProductosIndex() {
        return ResponseEntity.ok(productService.getNovedades());
    }

    @GetMapping("/moda")
    public ResponseEntity<List<Product>> getModa() {
        return ResponseEntity.ok(productService.getModa());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String nombre) {
        return ResponseEntity.ok(productService.searchProductsByNombre(nombre));
    }

    @GetMapping("/{id}/variantes")
    public ResponseEntity<List<ProductVariant>> getProductVariants(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getVariantsByProductId(id));
    }

    @PostMapping("/{productId}/variantes")
    public ResponseEntity<ProductVariant> addVariantToProduct(
            @PathVariable Long productId,
            @RequestBody ProductVariant variant) {
        ProductVariant nuevaVariante = productService.addVariantToProduct(productId, variant);
        return ResponseEntity.ok(nuevaVariante);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestPart("producto") Product product,
            @RequestPart(value = "imagenFrente", required = false) MultipartFile imagenFrente,
            @RequestPart(value = "imagenEspalda", required = false) MultipartFile imagenEspalda) {

        // Si tu servicio guarda con imágenes:
        Product nuevoProducto = productService.createProductWithImages(product, imagenFrente, imagenEspalda);

        return ResponseEntity.ok(nuevoProducto);
    }

    @GetMapping("/unico")
    public ResponseEntity<List<Product>> getUnicos() {
        return ResponseEntity.ok(productService.getUnicos());
    }

    @GetMapping("/etiqueta/{etiqueta}")
    public ResponseEntity<List<Product>> getProductsByEtiqueta(@PathVariable EtiquetaDestacada etiqueta) {
        return ResponseEntity.ok(productService.getProductsByEtiqueta(etiqueta));
    }

}
