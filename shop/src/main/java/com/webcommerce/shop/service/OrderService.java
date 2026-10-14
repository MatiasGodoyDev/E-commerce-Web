package com.webcommerce.shop.service;

import com.webcommerce.dtos.DirectOrderRequest;
import com.webcommerce.shop.model.Order;
import java.util.List;

public interface OrderService {

    Order crearOrden(Long userId, String direccionEnvio, String codPostalEnvio, String metodoPago);

    List<Order> obtenerHistorialCompras(Long userId);

    Order obtenerOrdenPorId(Long orderId);

    Order crearOrdenDirecta(DirectOrderRequest req);

    List<Order> listarTodasLasOrdenes();

    Order actualizarEstado(Long orderId, String nuevoEstado);

}
