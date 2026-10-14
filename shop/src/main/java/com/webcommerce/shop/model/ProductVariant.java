package com.webcommerce.shop.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.webcommerce.shop.enums.Talles;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonBackReference
    private Product producto;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Talles talle;

    @Column(nullable = false)
    private String color;

    private String colorHex;

    @Column(nullable = false)
    private Integer stock = 0;

}