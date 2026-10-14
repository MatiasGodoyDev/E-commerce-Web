package com.webcommerce.shop.repository;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.webcommerce.shop.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

        List<Order> findByUserIdOrderByFechaCompraDesc(Long userId);

        List<Order> findByEstado(String estado);

        @Query("SELECT SUM(o.total) FROM Order o WHERE o.user.id = :userId")
        BigDecimal sumTotalByUserId(@Param("userId") Long userId);
}
