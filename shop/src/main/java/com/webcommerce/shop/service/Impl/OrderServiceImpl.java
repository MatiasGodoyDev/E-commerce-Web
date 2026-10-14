package com.webcommerce.shop.service.Impl;

import com.webcommerce.shop.model.Order;
import com.webcommerce.shop.repository.UserRepository;
import com.webcommerce.shop.model.OrderItem;
import com.webcommerce.shop.model.Product;
import com.webcommerce.dtos.DirectOrderRequest;
import com.webcommerce.shop.enums.EstadoOrden;
import com.webcommerce.shop.model.Cart;
import com.webcommerce.shop.model.User;
import com.webcommerce.shop.model.ProductVariant;
import com.webcommerce.shop.repository.OrderRepository;
import com.webcommerce.shop.repository.ProductVariantRepository;
import com.webcommerce.shop.service.OrderService;
import com.webcommerce.shop.service.CartService;
import com.webcommerce.shop.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final CartService cartService;
    private final UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    public OrderServiceImpl(OrderRepository orderRepository, ProductVariantRepository variantRepository,
            CartService cartService, UserService userService) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.cartService = cartService;
        this.userService = userService;
    }

    ;

    @Override
    @Transactional
    public Order crearOrden(Long userId, String direccionEnvio, String codPostalEnvio, String metodoPago) {
        User user = userService.obtenerPerfilPorId(userId);
        Cart cart = cartService.getCartByUserId(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("No podés comprar con un carrito vacío.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setDireccionEnvio(direccionEnvio);
        order.setCodPostalEnvio(codPostalEnvio);
        order.setEstado(EstadoOrden.PENDIENTE);
        order.setTotal(cart.getTotalGeneral());
        order.setFechaCompra(LocalDateTime.now());
        for (var cartItem : cart.getItems()) {
            ProductVariant variante = cartItem.getVariante();

            if (variante.getStock() < cartItem.getCantidad()) {
                throw new RuntimeException("Se agotó el stock de la prenda: " + variante.getProducto().getNombre()
                        + " (" + variante.getTalle() + ")");
            }

            variante.setStock(variante.getStock() - cartItem.getCantidad());
            variantRepository.save(variante);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariante(variante);
            orderItem.setCantidad(cartItem.getCantidad());

            orderItem.setPrecioUnitarioConDescuento(variante.getProducto().getPrecioFinal());

            order.getItems().add(orderItem);
        }

        Order ordenGuardada = orderRepository.save(order);

        cartService.clearCart(userId);

        evaluarYPromoverVIP(user);

        return ordenGuardada;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> obtenerHistorialCompras(Long userId) {
        return orderRepository.findByUserIdOrderByFechaCompraDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Order obtenerOrdenPorId(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("La orden de compra no existe."));
    }

    private void evaluarYPromoverVIP(User user) {
        if (user.getRol() == com.webcommerce.shop.enums.Roles.CLIENTE) {
            java.math.BigDecimal totalGastado = orderRepository.sumTotalByUserId(user.getId());
            if (totalGastado != null && totalGastado.compareTo(new java.math.BigDecimal("500000")) >= 0) {
                user.setRol(com.webcommerce.shop.enums.Roles.CLIENTEVIP);
            }

        }
    }

    @Override
    @Transactional
    public Order crearOrdenDirecta(DirectOrderRequest req) {
        User user = userRepository.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ProductVariant variante = variantRepository.findById(req.varianteId())
                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));

        if (variante.getStock() < req.cantidad()) {
            throw new RuntimeException("Se agotó el stock de la prenda: " +
                    variante.getProducto().getNombre() + " (" + variante.getTalle() + ")");
        }

        variante.setStock(variante.getStock() - req.cantidad());
        variantRepository.save(variante);

        BigDecimal precioUnitario = variante.getProducto().getPrecioFinal();
        BigDecimal total = precioUnitario.multiply(BigDecimal.valueOf(req.cantidad()));

        Order orden = new Order();
        orden.setUser(user);
        orden.setTotal(total);
        orden.setEstado(EstadoOrden.PENDIENTE);
        orden.setDireccionEnvio(req.direccionEnvio());
        orden.setCodPostalEnvio(req.codPostalEnvio());
        orden.setFechaCompra(LocalDateTime.now());

        OrderItem item = new OrderItem();
        item.setVariante(variante);
        item.setCantidad(req.cantidad());
        item.setPrecioUnitarioConDescuento(precioUnitario);
        item.setOrder(orden);
        orden.getItems().add(item);

        Order savedOrder = orderRepository.save(orden);

        evaluarYPromoverVIP(user);

        return savedOrder;
    }

    @Override
    public List<Order> listarTodasLasOrdenes() {
        return orderRepository.findAll();
    }

    @Override
    public Order actualizarEstado(Long orderId, String nuevoEstado) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isPresent()) {
            Order orden = orderOpt.get();

            orden.setEstado(EstadoOrden.valueOf(nuevoEstado.toUpperCase()));

            return orderRepository.save(orden);
        } else {
            throw new RuntimeException("No se encontró la orden con el ID: " + orderId);
        }
    }

}
