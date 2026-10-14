package com.webcommerce.dtos;

public class WishlistRequestDTO {
    private Long userId;
    private Long productoId;

    public WishlistRequestDTO() {}

    public WishlistRequestDTO(Long userId, Long productoId) {
        this.userId = userId;
        this.productoId = productoId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }
}