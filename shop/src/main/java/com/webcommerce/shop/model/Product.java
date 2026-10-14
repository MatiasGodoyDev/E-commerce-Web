package com.webcommerce.shop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.webcommerce.shop.enums.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioBase;

    @Column(name = "porcentaje_descuento")
    private Double porcentajeDescuento = 0.0;

    @Enumerated(EnumType.STRING)
    private Gender genero;

    private String categoria;

    @Enumerated(EnumType.STRING)
    private CutType tipoCorte;

    @Column(nullable = false)
    private String materialPrincipal;

    @Enumerated(EnumType.STRING)
    private TipoEstampado tipoEstampado;

    @Enumerated(EnumType.STRING)
    private Season temporada;

    @Enumerated(EnumType.STRING)
    private EtiquetaDestacada etiquetaDestacada = EtiquetaDestacada.NINGUNA;
    private boolean esNovedad = false;
    private boolean esOferta = false;
    private boolean esUnico = false;
    private boolean esModa = false;
    private boolean esPersonalizado = false;

    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    List<ProductVariant> variantes;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public BigDecimal getPrecioFinal() {
        if (porcentajeDescuento == null || porcentajeDescuento <= 0) {
            return precioBase;
        }
        BigDecimal factor = BigDecimal.valueOf(1 - (porcentajeDescuento / 100.0));
        return precioBase.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    @Column(name = "imagen_frente")
    private String imagenFrente;
    @Column(name = "imagen_dorso")
    private String imagenEspalda;

}
