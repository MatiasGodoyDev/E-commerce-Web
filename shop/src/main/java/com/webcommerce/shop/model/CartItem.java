package com.webcommerce.shop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "cart_items")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrito_id", nullable = false)
    @JsonIgnore
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private ProductVariant variante;

    @Column(nullable = false)
    private Integer cantidad = 1;

    public BigDecimal getSubtotal() {
        if (variante == null || variante.getProducto() == null) {
            return BigDecimal.ZERO;
        }
        return variante.getProducto().getPrecioFinal().multiply(BigDecimal.valueOf(cantidad));
    }

}