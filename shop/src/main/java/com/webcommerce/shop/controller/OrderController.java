package com.webcommerce.shop.controller;

import com.webcommerce.dtos.DirectOrderRequest;
import com.webcommerce.shop.model.Order;
import com.webcommerce.shop.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> crearOrden(
            @RequestParam Long userId,
            @RequestParam String direccionEnvio,
            @RequestParam String codPostalEnvio,
            @RequestParam String metodoPago) {

        Order nuevaOrden = orderService.crearOrden(userId, direccionEnvio, codPostalEnvio, metodoPago);
        return ResponseEntity.ok(nuevaOrden);
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Order>> obtenerHistorialCompras(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.obtenerHistorialCompras(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> obtenerOrdenPorId(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.obtenerOrdenPorId(orderId));
    }

    @PostMapping("/direct")
    public ResponseEntity<Order> crearOrdenDirecta(@RequestBody DirectOrderRequest request) {
        Order nuevaOrden = orderService.crearOrdenDirecta(request);
        return ResponseEntity.ok(nuevaOrden);
    }

    @GetMapping
    public ResponseEntity<List<Order>> listarTodasLasOrdenes() {
        return ResponseEntity.ok(orderService.listarTodasLasOrdenes());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> actualizarEstadoOrden(@PathVariable Long id, @RequestBody EstadoRequest request) {
        try {
            Order ordenActualizada = orderService.actualizarEstado(id, request.getNuevoEstado());
            return ResponseEntity.ok(ordenActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class EstadoRequest {
        private String nuevoEstado;

        public String getNuevoEstado() {
            return nuevoEstado;
        }

        public void setNuevoEstado(String nuevoEstado) {
            this.nuevoEstado = nuevoEstado;
        }
    }

}
