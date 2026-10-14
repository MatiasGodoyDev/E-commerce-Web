document.addEventListener("DOMContentLoaded", () => {
    const userId = obtenerUserIdActivo();
    const esWishlistPage = Boolean(document.getElementById("wishlist-grid")) || window.location.pathname.includes("wishlist");

    if (esWishlistPage) {
        renderizarPaginaWishlist(userId);
    } else {
        sincronizarFavoritosDesdeServidor(userId);
        obtenerYActualizarContadorWishlistTop(userId);
    }

    document.addEventListener("click", async (e) => {

        const tarjetaParaRedirigir = e.target.closest(".tarjeta-producto, .wishlist-product-card");
        if (tarjetaParaRedirigir) {
            if (!e.target.closest(".wishlist-btn, .btn-fav-toggle, .btn-heart-toggle, .btn-action-icon, .add-to-cart-btn, .btn-cart-quick")) {
                const productoId = tarjetaParaRedirigir.dataset.productoId;
                if (productoId) {
                    window.location.href = `/descripcion?id=${productoId}`;
                    return;
                }
            }
        }

        const botonFav = e.target.closest(".wishlist-btn, .btn-fav-toggle, .btn-heart-toggle");
        if (botonFav) {
            e.preventDefault();
            e.stopPropagation();

            const tarjetaProducto = botonFav.closest(".tarjeta-producto, .wishlist-product-card, [data-producto-id]");
            if (!tarjetaProducto) return;

            const productoId = tarjetaProducto.dataset.productoId;
            const nombreProducto = tarjetaProducto.querySelector(".product-name, h3, h4")?.textContent.trim() || "Producto";
            const precioProducto = tarjetaProducto.querySelector(".product-price")?.textContent.replace("$", "").trim() || "0";
            const imagenProducto = tarjetaProducto.querySelector("img")?.src || "/Imagenes/Logo.png";

            if (!productoId) return console.error("Falta data-producto-id");

            const icono = botonFav.querySelector("i");
            const esFavorito = botonFav.classList.contains("activo") ||
                botonFav.classList.contains("in-wishlist") ||
                (icono && icono.classList.contains("fa-solid"));

            const esPaginaWishlist = Boolean(tarjetaProducto.closest(".wishlist-product-card")) || window.location.pathname.includes("wishlist");

            if (!esUsuarioLogueado()) {
                let guestWishlist = obtenerGuestWishlist();
                const index = guestWishlist.findIndex(i => String(i.id) === String(productoId));

                if (esFavorito || esPaginaWishlist || index !== -1) {
                    guestWishlist = guestWishlist.filter(i => String(i.id) !== String(productoId));
                    guardarGuestWishlist(guestWishlist);

                    botonFav.classList.remove("activo", "in-wishlist");
                    if (icono) { icono.classList.remove("fa-solid"); icono.classList.add("fa-regular"); }

                    if (esPaginaWishlist) {
                        tarjetaProducto.style.transition = "all 0.3s ease";
                        tarjetaProducto.style.opacity = "0";
                        tarjetaProducto.style.transform = "scale(0.9)";
                        setTimeout(() => {
                            tarjetaProducto.remove();
                            actualizarResumenWishlist();
                            obtenerYActualizarContadorWishlistTop(null);
                            mostrarNotificacion(`💔 "${nombreProducto}" fue eliminado.`);
                        }, 300);
                        return;
                    }
                    mostrarNotificacion(`💔 "${nombreProducto}" fue quitado.`);
                } else {
                    guestWishlist.push({
                        id: productoId,
                        nombre: nombreProducto,
                        precioBase: parseFloat(precioProducto) || 0,
                        imagenFrente: imagenProducto
                    });
                    guardarGuestWishlist(guestWishlist);

                    botonFav.classList.add("activo", "in-wishlist");
                    if (icono) { icono.classList.remove("fa-regular"); icono.classList.add("fa-solid"); }
                    mostrarNotificacion(`❤️ "${nombreProducto}" se agregó a tu lista de deseos.`);
                }

                obtenerYActualizarContadorWishlistTop(null);
                return;
            }

            const metodo = (esFavorito || esPaginaWishlist) ? 'DELETE' : 'POST';
            const url = `${API_BASE_URL}/wishlist?userId=${userId}&productoId=${productoId}`;

            try {
                const respuesta = await fetch(url, { method: metodo });
                if (respuesta.ok) {
                    if (metodo === 'POST') {
                        botonFav.classList.add("activo", "in-wishlist");
                        if (icono) { icono.classList.remove("fa-regular"); icono.classList.add("fa-solid"); }
                        mostrarNotificacion(`❤️ "${nombreProducto}" se agregó a tu lista de deseos.`);
                    } else {
                        botonFav.classList.remove("activo", "in-wishlist");
                        if (icono) { icono.classList.remove("fa-solid"); icono.classList.add("fa-regular"); }

                        if (esPaginaWishlist) {
                            tarjetaProducto.style.transition = "all 0.3s ease";
                            tarjetaProducto.style.opacity = "0";
                            tarjetaProducto.style.transform = "scale(0.9)";
                            setTimeout(() => {
                                tarjetaProducto.remove();
                                actualizarResumenWishlist();
                                obtenerYActualizarContadorWishlistTop(userId);
                                mostrarNotificacion(`💔 "${nombreProducto}" fue eliminado.`);
                            }, 300);
                            return;
                        }
                        mostrarNotificacion(`💔 "${nombreProducto}" fue quitado.`);
                    }
                    obtenerYActualizarContadorWishlistTop(userId);
                } else {
                    alert("Error al procesar favoritos.");
                }
            } catch (error) {
                console.error("Error de red:", error);
            }
        }

        const botonCarrito = e.target.closest(".add-to-cart-btn, .btn-cart-quick");
        if (botonCarrito) {
            e.preventDefault();
            e.stopPropagation();

            const tarjetaProducto = botonCarrito.closest(".tarjeta-producto, .wishlist-product-card, [data-producto-id]");
            if (!tarjetaProducto) return;

            const productoId = tarjetaProducto.dataset.productoId;
            const varianteId = tarjetaProducto.dataset.varianteId || productoId;
            const nombreProducto = tarjetaProducto.querySelector(".product-name, h3, h4")?.textContent.trim() || "Producto";
            const precioProducto = parseFloat(tarjetaProducto.querySelector(".product-price")?.textContent.replace("$", "").trim()) || 0;
            const imagenProducto = tarjetaProducto.querySelector("img")?.src || "/Imagenes/Logo.png";

            if (typeof agregarAlCarrito === 'function') {
                await agregarAlCarrito(varianteId, 1, {
                    nombre: nombreProducto,
                    precio: precioProducto,
                    imagen: imagenProducto
                });
                return;
            }

            if (!esUsuarioLogueado()) {
                mostrarNotificacion(`🛒 ¡"${nombreProducto}" se añadió al carrito local!`);
                actualizarContadorCarrito();
                return;
            }

            try {
                const respuesta = await fetch(`${API_BASE_URL}/cart/items?userId=${userId}&varianteId=${varianteId}&cantidad=1`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (respuesta.ok) {
                    mostrarNotificacion(`🛒 ¡"${nombreProducto}" se añadió al carrito con éxito!`);
                    actualizarContadorCarrito();
                } else {
                    const errorMsg = await respuesta.text();
                    alert(`No se pudo agregar: ${errorMsg || 'Verifique el stock'}`);
                }
            } catch (error) {
                console.error("Error al agregar al carrito desde wishlist:", error);
                alert("Error de conexión al intentar agregar al carrito.");
            }
        }
    });
});

function esUsuarioLogueado() {
    const userSession = JSON.parse(localStorage.getItem("userSession") || "{}");
    return Boolean(userSession.id || userSession.userId || localStorage.getItem("userId"));
}

function obtenerUserIdActivo() {
    try {
        const userSession = JSON.parse(localStorage.getItem("userSession") || "{}");
        const idFromSession = userSession.id || userSession.userId;
        const idFromStorage = localStorage.getItem("userId");

        const idFinal = idFromSession || idFromStorage || "1";
        return idFinal;
    } catch (e) {
        return "1";
    }
}

function obtenerGuestWishlist() {
    return JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
}

function guardarGuestWishlist(wishlist) {
    localStorage.setItem("guest_wishlist", JSON.stringify(wishlist));
}

async function renderizarPaginaWishlist(userId) {
    const grid = document.getElementById("wishlist-grid");
    if (!grid) return;

    let favoritos = [];

    if (!esUsuarioLogueado()) {
        favoritos = obtenerGuestWishlist();
    } else {
        try {
            const respuesta = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}`);
            if (!respuesta.ok) throw new Error("No se pudo cargar la wishlist");
            favoritos = await respuesta.json();
        } catch (error) {
            console.error("Error renderizando wishlist:", error);
            grid.innerHTML = '<p>Error al cargar la lista.</p>';
            return;
        }
    }

    const contadorTop = document.getElementById("contador-wishlist") || document.getElementById("wishlist-count");
    if (contadorTop) contadorTop.textContent = favoritos.length;

    if (favoritos.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Tu lista de deseos está vacía 💔</p>';
        actualizarResumenWishlist(0);
        return;
    }

    grid.innerHTML = favoritos.map(prod => {
        const imagenSrc = prod.imagenFrente || prod.imagenEspalda || prod.imagen || '/Imagenes/Logo.png';

        return `
            <div class="wishlist-product-card tarjeta-producto" data-producto-id="${prod.id}" data-variante-id="${prod.varianteId || prod.id}">
                <div class="product-img-box" style="width: 100%; height: 220px; overflow: hidden; background-color: #f9f9f9; border-radius: 8px;">
                    <img src="${imagenSrc}" alt="${prod.nombre}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="product-card-footer">
                    <div class="product-text-details">
                        <h3 class="product-name">${prod.nombre}</h3>
                        <span class="product-price">$${prod.precioFinal || prod.precioBase || 0}</span>
                    </div>
                    <div class="product-actions-group">
                        <button type="button" class="btn-action-icon btn-fav-toggle activo in-wishlist" title="Quitar">❤️</button>
                        <button type="button" class="btn-action-icon btn-cart-quick" title="Al carrito">🛒</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    actualizarResumenWishlist(favoritos.length);
}

function actualizarResumenWishlist(countOverride) {
    const summaryText = document.querySelector(".wishlist-summary-text");
    if (!summaryText) return;
    const count = countOverride ?? document.querySelectorAll(".wishlist-product-card").length;
    summaryText.innerHTML = `Tenés <strong>${count} prendas</strong> guardadas en tu lista de deseos. Podés pasarlas directo al carrito para comprarlas o seguir mirando novedades de la tienda.`;
}

async function sincronizarFavoritosDesdeServidor(userId) {
    if (!esUsuarioLogueado()) {
        const guestWishlist = obtenerGuestWishlist();
        guestWishlist.forEach(prod => {
            const tarjeta = document.querySelector(`[data-producto-id="${prod.id}"]`);
            if (tarjeta) {
                const botonFav = tarjeta.querySelector(".wishlist-btn, .btn-fav-toggle, .btn-heart-toggle");
                if (botonFav) {
                    botonFav.classList.add("activo", "in-wishlist");
                    const icono = botonFav.querySelector("i");
                    if (icono) { icono.classList.remove("fa-regular"); icono.classList.add("fa-solid"); }
                }
            }
        });
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}`);
        if (respuesta.ok) {
            const favoritos = await respuesta.json();
            favoritos.forEach(prod => {
                const tarjeta = document.querySelector(`[data-producto-id="${prod.id}"]`);
                if (tarjeta) {
                    const botonFav = tarjeta.querySelector(".wishlist-btn, .btn-fav-toggle, .btn-heart-toggle");
                    if (botonFav) {
                        botonFav.classList.add("activo", "in-wishlist");
                        const icono = botonFav.querySelector("i");
                        if (icono) { icono.classList.remove("fa-regular"); icono.classList.add("fa-solid"); }
                    }
                }
            });
        }
    } catch (error) { console.error("Error sincronizando:", error); }
}

async function obtenerYActualizarContadorWishlistTop(userId) {
    if (!esUsuarioLogueado()) {
        const guestWishlist = obtenerGuestWishlist();
        const contador = document.getElementById("wishlist-count") || document.getElementById("contador-wishlist");
        if (contador) {
            contador.textContent = guestWishlist.length > 9 ? "9+" : guestWishlist.length;
        }
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/wishlist/count?userId=${userId}`);
        if (respuesta.ok) {
            const data = await respuesta.json();
            const totalFavoritos = typeof data === 'object' ? (data.count || data.total || 0) : data;

            const contador = document.getElementById("wishlist-count") || document.getElementById("contador-wishlist");

            if (contador) {
                contador.textContent = totalFavoritos > 9 ? "9+" : totalFavoritos;
            }
        }
    } catch (error) {
        console.error("Error en la petición del contador top:", error);
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito") || document.getElementById("cart-count");
    if (contador) contador.textContent = parseInt(contador.textContent || "0") + 1;
}

function mostrarNotificacion(mensaje) {
    console.log("[NOTIFICACIÓN]:", mensaje);
    alert(mensaje);
}