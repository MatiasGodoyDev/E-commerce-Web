package com.webcommerce.shop.service.Impl;

import com.webcommerce.shop.model.Product;
import com.webcommerce.shop.model.ProductVariant;
import com.webcommerce.shop.enums.EtiquetaDestacada;
import com.webcommerce.shop.enums.Gender;
import com.webcommerce.shop.repository.ProductRepository;
import com.webcommerce.shop.repository.ProductVariantRepository;
import com.webcommerce.shop.service.ProductService;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductServiceImpl(ProductRepository productRepository, ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("¡Ups! No encontramos la prenda con el ID: " + id));
    }

    @Override
    public List<Product> getOfertas() {
        return productRepository.findByEsOfertaTrue();
    }

    @Override
    public List<Product> getNovedades() {
        return productRepository.findByEsNovedadTrue();
    }

    @Override
    public List<Product> getModa() {
        return productRepository.findAll().stream()
                .filter(Product::isEsModa)
                .toList();
    }

    @Override
    public List<Product> getUnicos() {
        return productRepository.findAll().stream()
                .filter(Product::isEsUnico)
                .toList();
    }

    @Override
    public List<Product> getPersonalizado() {
        return productRepository.findAll().stream()
                .filter(Product::isEsPersonalizado)
                .toList();
    }

    @Override
    public List<Product> searchProductsByNombre(String nombre) {

        return productRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public List<Product> getProductsByCategoria(String categoria) {
        return productRepository.findByCategoria(categoria);
    }

    @Override
    public List<Product> getProductByGenero(Gender genero) {
        return productRepository.findByGenero(genero);
    }

    @Override
    public List<ProductVariant> getVariantsByProductId(Long productId) {

        return variantRepository.findByProductoId(productId);
    }

    @Override
    public Product createProduct(Product product) {
        if (product.getVariantes() != null && !product.getVariantes().isEmpty()) {
            for (ProductVariant variant : product.getVariantes()) {
                variant.setProducto(product);
                asegurarColorHex(variant);
            }
        }
        return productRepository.save(product);

    }

    @Override
    @Transactional
    public Product createProductWithImages(Product product, MultipartFile imagenFrente, MultipartFile imagenEspalda) {

        // 1. PRIMERO asociamos cada variante al producto padre
        if (product.getVariantes() != null && !product.getVariantes().isEmpty()) {
            for (ProductVariant variant : product.getVariantes()) {
                variant.setProducto(product);
                asegurarColorHex(variant);
            }
        }

        Product savedProduct = productRepository.save(product);

        try {
            Path uploadPath = Paths.get("src/main/resources/static/Imagenes/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            if (imagenFrente != null && !imagenFrente.isEmpty()) {
                String originalNameFrente = imagenFrente.getOriginalFilename();
                String cleanNameFrente = originalNameFrente != null
                        ? Paths.get(originalNameFrente).getFileName().toString()
                        : "frente.png";
                String fileNameFrente = System.currentTimeMillis() + "_frente_" + cleanNameFrente;

                Path filePathFrente = uploadPath.resolve(fileNameFrente);
                Files.copy(imagenFrente.getInputStream(), filePathFrente, StandardCopyOption.REPLACE_EXISTING);

                savedProduct.setImagenFrente("/Imagenes/" + fileNameFrente);
            }

            if (imagenEspalda != null && !imagenEspalda.isEmpty()) {
                String originalNameEspalda = imagenEspalda.getOriginalFilename();
                String cleanNameEspalda = originalNameEspalda != null
                        ? Paths.get(originalNameEspalda).getFileName().toString()
                        : "espalda.png";
                String fileNameEspalda = System.currentTimeMillis() + "_espalda_" + cleanNameEspalda;

                Path filePathEspalda = uploadPath.resolve(fileNameEspalda);
                Files.copy(imagenEspalda.getInputStream(), filePathEspalda, StandardCopyOption.REPLACE_EXISTING);

                savedProduct.setImagenEspalda("/Imagenes/" + fileNameEspalda);
            }

            savedProduct = productRepository.save(savedProduct);

        } catch (IOException e) {
            throw new RuntimeException("Fallo al almacenar los archivos de imagen.", e);
        }

        return savedProduct;
    }

    @Override
    @Transactional
    public ProductVariant addVariantToProduct(Long productId, ProductVariant variant) {
        Product product = getProductById(productId);
        variant.setProducto(product);
        asegurarColorHex(variant);
        return variantRepository.save(variant);
    }

    @Override
    public List<Product> getProductsByEtiqueta(EtiquetaDestacada etiqueta) {
        return productRepository.findByEtiquetaDestacada(etiqueta);
    }

    private void asegurarColorHex(ProductVariant variant) {
        if (variant.getColorHex() == null || variant.getColorHex().isBlank()) {
            String colorStr = variant.getColor() != null ? variant.getColor().toLowerCase().trim() : "";

            String hexFinal;

            switch (colorStr) {
                case "negro":
                case "black":
                    hexFinal = "#000000";
                    break;
                case "blanco":
                case "white":
                    hexFinal = "#FFFFFF";
                    break;
                case "gris":
                case "grey":
                case "gray":
                    hexFinal = "#808080";
                    break;
                case "rojo":
                case "red":
                    hexFinal = "#FF0000";
                    break;
                case "azul":
                case "blue":
                    hexFinal = "#0000FF";
                    break;
                case "verde":
                case "green":
                    hexFinal = "#008000";
                    break;
                case "amarillo":
                case "yellow":
                    hexFinal = "#FFFF00";
                    break;
                case "rosa":
                case "pink":
                    hexFinal = "#FFC0CB";
                    break;
                case "marron":
                case "marrón":
                case "brown":
                    hexFinal = "#8B4513";
                    break;
                case "beige":
                case "nude":
                    hexFinal = "#F5F5DC";
                    break;
                default:
                    int hash = colorStr.hashCode();
                    hexFinal = String.format("#%06X", (0xFFFFFF & hash));
                    break;
            }

            variant.setColorHex(hexFinal);
        }
    }
}
