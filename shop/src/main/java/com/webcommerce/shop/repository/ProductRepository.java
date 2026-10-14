package com.webcommerce.shop.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webcommerce.shop.enums.CutType;
import com.webcommerce.shop.enums.EtiquetaDestacada;
import com.webcommerce.shop.enums.Gender;
import com.webcommerce.shop.enums.Season;
import com.webcommerce.shop.enums.TipoEstampado;
import com.webcommerce.shop.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNombreContainingIgnoreCase(String nombre);

    List<Product> findByDescripcion(String descripcion);

    List<Product> findByCategoria(String categoria);

    List<Product> findByGenero(Gender genero);

    List<Product> findByMaterialPrincipal(String materialPrincipal);

    List<Product> findByEsNovedadTrue();

    List<Product> findByEsOfertaTrue();

    List<Product> findByEsModaTrue();

    List<Product> findByEsUnicoTrue();

    List<Product> findByEsPersonalizadoTrue();

    List<Product> findByTipoCorte(CutType tipoCorte);

    List<Product> findByTipoEstampado(TipoEstampado tipoEstampado);

    List<Product> findByTemporada(Season season);

    List<Product> findByEtiquetaDestacada(EtiquetaDestacada etiquetaDestacada);
}
