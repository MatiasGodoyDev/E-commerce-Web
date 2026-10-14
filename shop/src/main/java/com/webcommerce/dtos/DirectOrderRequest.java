package com.webcommerce.dtos;

public record DirectOrderRequest(
    Long userId,
    Long varianteId,
    Integer cantidad,
    String direccionEnvio,
    String codPostalEnvio,
    String metodoPago
) {}