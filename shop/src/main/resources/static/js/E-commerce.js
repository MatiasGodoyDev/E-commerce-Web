const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
  const userIcon = document.getElementById('user-icon');

  if (userIcon) {
    userIcon.addEventListener('click', (e) => {
      e.preventDefault();
      const userSession = localStorage.getItem('userSession');
      const userId = localStorage.getItem('userId');

      if (userSession && userId) {
        window.location.href = '/perfil';
      } else {
        window.location.href = '/login';
      }
    });
  }
});

async function cargarProductosBackend() {
  const contenedorGrid = document.querySelector('.products-grid');
  if (!contenedorGrid) return;

  const path = window.location.pathname;
  let endpoint = `${API_BASE_URL}/products`;

  if (path === '/' || path === '/index') {
    endpoint = `${API_BASE_URL}/products/index`;
  } else if (path.includes('/moda')) {
    endpoint = `${API_BASE_URL}/products/moda`;
  } else if (path.includes('/ofertas')) {
    endpoint = `${API_BASE_URL}/products/ofertas`;
  } else if (path.includes('/unico')) {
    endpoint = `${API_BASE_URL}/products/unico`;
  }

  try {
    const respuesta = await fetch(endpoint);
    if (respuesta.ok) {
      const productos = await respuesta.json();
      renderizarProductosHTML(productos);
    } else {
      console.warn('No se pudieron obtener productos del backend.');
    }
  } catch (error) {
    console.error('Error de red al conectar con el backend:', error);
  }
}

function generarBadgeEtiqueta(etiqueta) {
  if (!etiqueta || etiqueta === 'NINGUNA' || etiqueta === '') return '';

  let claseCss = '';
  let texto = '';

  switch (etiqueta) {
    case 'NUEVO':
      claseCss = 'badge-nuevo';
      texto = 'NUEVO';
      break;
    case 'EXCLUSIVO':
      claseCss = 'badge-exclusivo';
      texto = 'EXCLUSIVO';
      break;
    case 'ESPECIAL':
      claseCss = 'badge-especial';
      texto = 'ESPECIAL';
      break;
    case 'EDICION_ILIMITADA':
      claseCss = 'badge-limitada';
      texto = 'EDICIÓN LIMITADA';
      break;
    case 'PROMOCION_2X1':
      claseCss = 'badge-descuento badge-2x1';
      texto = '2X1';
      break;
    default:
      return '';
  }

  return `<span class="product-badge ${claseCss}">${texto}</span>`;
}

function renderizarProductosHTML(productos) {
  const contenedorGrid = document.querySelector('.products-grid');
  if (!contenedorGrid || !productos) return;

  contenedorGrid.innerHTML = '';

  if (productos.length === 0) {
    contenedorGrid.innerHTML = '<p class="sin-productos">No se encontraron productos cargados.</p>';
    return;
  }

  productos.forEach(prod => {
    const tallasStr = prod.variantes ? prod.variantes.map(v => v.talle.toLowerCase()).join(',') : '';
    const coloresStr = prod.variantes ? [...new Set(prod.variantes.map(v => v.color.toLowerCase()))].join(',') : '';

    const stockTotal = prod.variantes ? prod.variantes.reduce((acc, v) => acc + (v.stock || 0), 0) : (prod.stock || 0);
    const estaAgotado = stockTotal <= 0;

    const tieneEtiqueta = prod.etiquetaDestacada && prod.etiquetaDestacada !== 'NINGUNA' && prod.etiquetaDestacada !== '';

    let estado = '';
    if (prod.esNovedad) estado = 'novedades';
    else if (prod.esOferta) estado = 'ofertas';

    const article = document.createElement('article');
    article.classList.add('tarjeta-producto');

    if (estaAgotado) {
      article.classList.add('agotado');
    }

    article.dataset.productoId = prod.id;
    article.dataset.varianteId = (prod.variantes && prod.variantes.length > 0) ? prod.variantes[0].id : 1;
    article.dataset.precio = prod.precioBase || 0;

    article.innerHTML = `
      <div class="product-image-box">
        ${estaAgotado ? '<span class="product-badge badge-agotado">AGOTADO</span>' : generarBadgeEtiqueta(prod.etiquetaDestacada)}

        <button class="action-btn wishlist-btn ${tieneEtiqueta ? 'con-etiqueta' : ''}" title="Añadir a Favoritos" type="button">
          <i class="fa-regular fa-heart"></i>
        </button>

        <img src="${prod.imagenFrente || '/Imagenes/frente-removebg-preview.png'}" alt="${prod.nombre}" class="product-png product-front">
        <img src="${prod.imagenEspalda || prod.imagenFrente || '/Imagenes/atras-removebg-preview.png'}" alt="${prod.nombre} Espalda" class="product-png product-back">

        <button class="action-btn add-to-cart-btn" title="${estaAgotado ? 'Sin stock' : 'Añadir al Carrito'}" ${estaAgotado ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} type="button">
          <i class="fa-solid ${estaAgotado ? 'fa-ban' : 'fa-cart-plus'}"></i>
        </button>
      </div>
      <div class="product-info">
        <span class="product-price price-original" data-precio="${prod.precioBase || 0}" data-descuento="${prod.porcentajeDescuento || 0}" data-promo="${prod.tipoPromo || ''}">
          $${prod.precioBase ? prod.precioBase.toLocaleString('es-AR') : '0'}
        </span>
        <span class="product-price price-discount"></span>
      </div>
    `;

    contenedorGrid.appendChild(article);
  });

  procesarPreciosYOfertas();
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarProductosBackend();

  const selectOrdenar = document.getElementById('selectOrdenar');
  const contenedorGrid = document.querySelector('.products-grid');

  if (selectOrdenar && contenedorGrid) {
    selectOrdenar.addEventListener('change', (e) => {
      const criterio = e.target.value;
      let tarjetas = Array.from(contenedorGrid.querySelectorAll('.tarjeta-producto'));

      if (criterio === 'relevantes') {
        cargarProductosBackend();
        return;
      }

      tarjetas.sort((a, b) => {
        const precioA = parseFloat(a.dataset.precio) || 0;
        const precioB = parseFloat(b.dataset.precio) || 0;

        if (criterio === 'precio-bajo') return precioA - precioB;
        if (criterio === 'precio-alto') return precioB - precioA;
        return 0;
      });

      tarjetas.forEach(tarjeta => contenedorGrid.appendChild(tarjeta));
    });
  }

  if (contenedorGrid) {
    contenedorGrid.addEventListener('click', async (e) => {
      const tarjeta = e.target.closest('.tarjeta-producto');
      if (!tarjeta) return;

      const userId = obtenerUserIdActivo();

      const wishlistBtn = e.target.closest('.wishlist-btn');
      if (wishlistBtn) {
        e.stopPropagation();
        if (!userId) {
          alert("Debes iniciar sesión para gestionar tus favoritos.");
          window.location.href = '/login';
          return;
        }

        const productoId = tarjeta.dataset.productoId;
        if (!productoId) return;

        const isNowActive = wishlistBtn.classList.toggle('active');

        try {
          const metodo = isNowActive ? 'POST' : 'DELETE';
          const respuesta = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}&productoId=${productoId}`, { method: metodo });
          if (!respuesta.ok) wishlistBtn.classList.toggle('active');
        } catch (error) {
          wishlistBtn.classList.toggle('active');
          console.error("Error al actualizar favoritos:", error);
        }

        const wishlistBadge = document.getElementById('wishlist-count');
        if (wishlistBadge) {
          let currentWishlist = parseInt(wishlistBadge.textContent) || 0;
          currentWishlist = isNowActive ? currentWishlist + 1 : Math.max(0, currentWishlist - 1);
          wishlistBadge.textContent = currentWishlist;
          wishlistBadge.classList.toggle('visible', currentWishlist > 0);
          wishlistBadge.classList.remove('bump');
          void wishlistBadge.offsetWidth;
          wishlistBadge.classList.add('bump');
        }
        return;
      }

      const cartBtn = e.target.closest('.add-to-cart-btn');
      if (cartBtn) {
        e.stopPropagation();
        if (!userId) {
          alert("Debes iniciar sesión para agregar productos al carrito.");
          window.location.href = '/login';
          return;
        }

        const varianteId = tarjeta.dataset.varianteId || 1;
        const cantidadAgregar = 1;

        try {
          const respuestaCart = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
          if (!respuestaCart.ok) throw new Error("No se pudo obtener el carrito.");

          const carritoBD = await respuestaCart.json();
          const resItems = await fetch(`${API_BASE_URL}/cart/items/${carritoBD.id}`);
          const itemsDetallados = resItems.ok ? await resItems.json() : (carritoBD.items || []);

          const itemEnCarrito = itemsDetallados.find(i =>
            Number(i.varianteId) === Number(varianteId) || Number(i.variante?.id) === Number(varianteId)
          );

          const cantidadActualEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
          const stockReal = itemEnCarrito && itemEnCarrito.stock !== undefined ? itemEnCarrito.stock : 999;
          const totalDeseado = cantidadActualEnCarrito + cantidadAgregar;

          if (totalDeseado > stockReal) {
            alert(`⚠️ Stock excedido. Solo hay ${stockReal} unidades disponibles y ya tenés ${cantidadActualEnCarrito} en tu carrito.`);
            return;
          }

          if (itemEnCarrito) {
            const cartItemId = itemEnCarrito.cartItemId || itemEnCarrito.id;
            const responsePut = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}&nuevaCantidad=${totalDeseado}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!responsePut.ok) throw new Error("No se pudo actualizar la cantidad en el carrito.");
          } else {
            const respuesta = await fetch(`${API_BASE_URL}/cart/items?userId=${userId}&varianteId=${varianteId}&cantidad=${cantidadAgregar}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!respuesta.ok) {
              const errorTexto = await respuesta.text();
              throw new Error(errorTexto || "No se pudo agregar el producto al carrito");
            }
          }

          if (typeof actualizarContadorHeaderGlobal === 'function') {
            await actualizarContadorHeaderGlobal(userId);
          }

          const icon = cartBtn.querySelector('i');
          cartBtn.classList.add('added');
          if (icon) {
            icon.classList.remove('fa-cart-plus');
            icon.classList.add('fa-check');
          }
          setTimeout(() => {
            cartBtn.classList.remove('added');
            if (icon) {
              icon.classList.remove('fa-check');
              icon.classList.add('fa-cart-plus');
            }
          }, 1500);

        } catch (error) {
          console.error("Error al añadir al carrito:", error);
          alert(`❌ ${error.message}`);
        }
        return;
      }

      if (tarjeta.classList.contains("agotado")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const productoId = tarjeta.dataset.productoId;
      if (productoId) {
        window.location.href = `/descripcion?id=${productoId}`;
      }
    });
  }
});

function obtenerUserIdActivo() {
  try {
    const userSession = JSON.parse(localStorage.getItem("userSession") || "{}");
    return userSession.id || userSession.userId || localStorage.getItem("userId") || null;
  } catch (e) {
    return null;
  }
}

function procesarPreciosYOfertas() {
  const productos = document.querySelectorAll('.tarjeta-producto');

  const formatoMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  productos.forEach(producto => {
    const elPrecioOriginal = producto.querySelector('.price-original');
    const elPrecioDescuento = producto.querySelector('.price-discount');
    const cajaImagen = producto.querySelector('.product-image-box');

    if (!elPrecioOriginal) return;

    const precioBase = parseFloat(elPrecioOriginal.dataset.precio || 0);
    const porcentajeDescuento = parseInt(elPrecioOriginal.dataset.descuento || 0);
    const tipoPromo = elPrecioOriginal.dataset.promo;

    if (tipoPromo) {
      elPrecioOriginal.textContent = formatoMoneda.format(precioBase);
      const badge = document.createElement('span');
      badge.classList.add('badge-descuento');
      const claseLimpia = tipoPromo.toLowerCase().replace(/[^a-z0-9]/g, '');
      badge.classList.add(`badge-${claseLimpia}`);
      badge.textContent = tipoPromo.toUpperCase();
      cajaImagen.appendChild(badge);
    }
    else if (porcentajeDescuento > 0 && precioBase > 0) {
      const montoDescuento = (precioBase * porcentajeDescuento) / 100;
      const precioFinal = precioBase - montoDescuento;

      elPrecioOriginal.textContent = formatoMoneda.format(precioBase);
      if (elPrecioDescuento) elPrecioDescuento.textContent = formatoMoneda.format(precioFinal);
      elPrecioOriginal.classList.add('has-discount');

      const badge = document.createElement('span');
      badge.classList.add('badge-descuento');
      badge.innerHTML = `${porcentajeDescuento}%<small>OFF</small>`;
      cajaImagen.appendChild(badge);
    }
    else {
      elPrecioOriginal.textContent = formatoMoneda.format(precioBase);
      if (elPrecioDescuento) elPrecioDescuento.textContent = '';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pasoSeleccion = document.getElementById("paso-seleccion");
  const pasoPersonalizador = document.getElementById("paso-personalizador");
  const botonesPrenda = document.querySelectorAll(".card-opcion");
  const btnVolver = document.getElementById("btn-volver");
  const tituloPrendaActual = document.getElementById("titulo-prenda-actual");

  botonesPrenda.forEach((boton) => {
    boton.addEventListener("click", () => {
      const prendaSeleccionada = boton.dataset.prenda;
      if (pasoSeleccion) pasoSeleccion.style.display = "none";
      if (pasoPersonalizador) pasoPersonalizador.style.display = "block";
      if (tituloPrendaActual) tituloPrendaActual.textContent = `Editando: ${prendaSeleccionada.toUpperCase()}`;
      cargarModelo3D(prendaSeleccionada);
    });
  });

  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      if (pasoPersonalizador) pasoPersonalizador.style.display = "none";
      if (pasoSeleccion) pasoSeleccion.style.display = "block";
    });
  }
});

function cargarModelo3D(tipoPrenda) {
  console.log(`Cargando modelo 3D para: ${tipoPrenda}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const inputPrecioBase = document.querySelector('input[name="precioBase"]') || document.querySelector('#precioBase');
  const inputDescuento = document.querySelector('input[name="porcentajeDescuento"]') || document.querySelector('#descuento');

  if (inputPrecioBase && inputDescuento) {
    const contenedorDescuento = inputDescuento.parentElement;
    const spanResultado = document.createElement('div');
    spanResultado.style.marginTop = '6px';
    spanResultado.style.fontSize = '14px';
    spanResultado.style.fontWeight = 'bold';
    spanResultado.style.color = '#e53935';
    contenedorDescuento.appendChild(spanResultado);

    function calcularPrecioFinalAdmin() {
      const precioBase = parseFloat(inputPrecioBase.value) || 0;
      const descuento = parseFloat(inputDescuento.value) || 0;

      if (descuento > 0 && precioBase > 0) {
        const montoDescuento = (precioBase * descuento) / 100;
        const precioFinal = precioBase - montoDescuento;
        spanResultado.textContent = `Precio final con descuento: $${precioFinal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
      } else {
        spanResultado.textContent = '';
      }
    }

    inputPrecioBase.addEventListener('input', calcularPrecioFinalAdmin);
    inputDescuento.addEventListener('input', calcularPrecioFinalAdmin);
  }
});

document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible") {
    console.log("👁️ El usuario volvió a la pestaña. Actualizando datos y stock en tiempo real...");

    if (typeof cargarProductosBackend === 'function') {
      await cargarProductosBackend();
    }

    const userId = obtenerUserIdActivo();
    if (userId) {
      if (typeof obtenerYActualizarContadorWishlistTop === 'function') {
        await obtenerYActualizarContadorWishlistTop(userId);
      }
      if (typeof actualizarContadorHeaderGlobal === 'function') {
        await actualizarContadorHeaderGlobal(userId);
      }
    }
  }
});