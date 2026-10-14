document.addEventListener("DOMContentLoaded", () => {
    const userId = obtenerUserIdActivo();
    const esCarritoPage = Boolean(document.querySelector(".cart-items-list")) &&
        (window.location.pathname.includes("cart") || window.location.pathname.includes("carrito"));

    if (esCarritoPage) {
        cargarCarritoDinamico(userId);
    }

    verificarProductosEnCarrito();
    actualizarBadgeHeaderGlobal();
});

function esUsuarioLogueado() {
    try {
        const userSessionRaw = localStorage.getItem("userSession");
        if (!userSessionRaw || userSessionRaw === "null" || userSessionRaw === "undefined") {
            return false;
        }
        const userSession = JSON.parse(userSessionRaw);
        const userId = userSession.id || userSession.userId || localStorage.getItem("userId");

        return Boolean(userId && userId !== "null" && userId !== "undefined" && userId !== "NaN");
    } catch (e) {
        return false;
    }
}

function obtenerUserIdActivo() {
    if (!esUsuarioLogueado()) return null;

    try {
        const userSession = JSON.parse(localStorage.getItem("userSession") || "{}");
        return userSession.id || userSession.userId || localStorage.getItem("userId") || document.body.dataset.userId || null;
    } catch (e) {
        return null;
    }
}

function obtenerGuestCart() {
    return JSON.parse(localStorage.getItem("guest_cart") || "[]");
}

function guardarGuestCart(cart) {
    localStorage.setItem("guest_cart", JSON.stringify(cart));
}

function actualizarBadgeHeaderGlobal() {
    const totalHeaderBadge = document.getElementById("cart-count") || document.getElementById("contador-carrito");
    if (!totalHeaderBadge) return;

    if (!esUsuarioLogueado()) {
        const guestCart = obtenerGuestCart();
        const total = guestCart.reduce((acc, item) => acc + (item.cantidad || 1), 0);
        totalHeaderBadge.textContent = total;
    }
}

async function cargarCarritoDinamico(userId) {
    const listaItems = document.querySelector(".cart-items-list");
    if (!listaItems) return;

    if (!esUsuarioLogueado() || !userId) {
        console.log("🛒 Cargando carrito en modo invitado (LocalStorage)...");
        const itemsInvitado = obtenerGuestCart();
        const subtotalInvitado = itemsInvitado.reduce((acc, item) => acc + (item.productoPrecio * item.cantidad), 0);

        renderizarItemsEnDOM(itemsInvitado, null);
        actualizarResumenTotales({ totalGeneral: subtotalInvitado }, itemsInvitado);
        vincularEventosCarritoInvitado();
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
        if (!respuesta.ok) throw new Error("Error al obtener carrito");
        const carritoBD = await respuesta.json();

        console.log("Carrito recibido del backend:", carritoBD);

        const resItems = await fetch(`${API_BASE_URL}/cart/items/${carritoBD.id}`);
        const itemsDetallados = resItems.ok ? await resItems.json() : (carritoBD.items || []);

        renderizarItemsEnDOM(itemsDetallados, userId);
        actualizarResumenTotales(carritoBD, itemsDetallados);
        vincularEventosCarrito(userId);

    } catch (error) {
        console.error("Error al cargar carrito:", error);
    }
}

function renderizarItemsEnDOM(items, userId) {
    const listaItems = document.querySelector(".cart-items-list");
    if (!listaItems) return;

    if (!items || items.length === 0) {
        listaItems.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #777;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">🛒 Tu carrito está vacío</p>
                <a href="index.html" style="color: #000; font-weight: bold; text-decoration: underline;">Volver a la tienda</a>
            </div>
        `;
        return;
    }

    listaItems.innerHTML = items.map(item => {
        const nombre = item.productoNombre || item.nombre || "Producto";
        const precioUnitario = item.precioFinal || item.productoPrecio || item.precio || 0;
        const imagen = item.imagenFrente || item.imagenEspalda || item.imagen || item.productoImagen || '/Imagenes/Logo.png';
        const talle = item.talle || 'Única';
        const colorHex = item.colorHex || '#cccccc';
        const identifier = item.cartItemId || item.id;
        const productoIdReal = item.productoId || item.idProducto || item.id;

        return `
            <div class="cart-item" data-cart-item-id="${identifier}" data-variante-id="${item.varianteId || ''}">
                <!-- 🔗 Imagen con enlace a la descripción -->
                <a href="/descripcion?id=${productoIdReal}" class="item-img" style="width: 80px; height: 80px; overflow: hidden; border-radius: 8px; display: block;">
                    <img src="${imagen}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;">
                </a>
                <div class="item-info">
                    <!-- 🔗 Título con enlace a la descripción -->
                    <a href="/descripcion?id=${productoIdReal}" class="item-title" style="text-decoration: none; color: inherit; font-weight: bold;">${nombre}</a>
                    <div class="item-meta" style="display: flex; align-items: center; gap: 8px; margin: 5px 0;">
                        Talle: ${talle} | Color: 
                        <span class="circulo-color-carrito" style="display: inline-block; background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ddd; vertical-align: middle;"></span>
                    </div>
                    <div class="qty-picker">
                        <button type="button" class="btn-restar">-</button>
                        <span>${item.cantidad}</span>
                        <button type="button" class="btn-sumar">+</button>
                    </div>
                </div>
                <div class="item-price-col">
                    <div class="item-price">$${parseFloat(precioUnitario * item.cantidad).toFixed(2)}</div>
                    <button type="button" class="btn-delete" style="color: red; background: none; border: none; cursor: pointer; margin-top: 5px;">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function actualizarResumenTotales(carritoBD, items) {
    const resumenSubtotal = document.getElementById("subtotal-carrito-texto") || document.querySelector(".cart-summary .summary-row span:nth-child(2)");
    const resumenTotal = document.getElementById("total-carrito-texto") || document.querySelector(".cart-summary .total span:nth-child(2)");
    const totalHeaderBadge = document.getElementById("cart-count") || document.getElementById("contador-carrito");

    const montoTotal = carritoBD.totalGeneral || carritoBD.total || 0;
    const numeroFormateado = parseFloat(montoTotal).toFixed(2);

    if (resumenSubtotal) resumenSubtotal.textContent = `$${numeroFormateado}`;
    if (resumenTotal) resumenTotal.textContent = `$${numeroFormateado}`;

    let cantidadItemsTotal = 0;
    if (items && Array.isArray(items)) {
        items.forEach(item => {
            cantidadItemsTotal += (item.cantidad || 1);
        });
    }

    if (totalHeaderBadge) {
        totalHeaderBadge.textContent = cantidadItemsTotal;
    }

    const btnCheckout = document.querySelector(".btn-checkout");
    if (!items || items.length === 0) {
        if (btnCheckout) {
            btnCheckout.disabled = true;
            btnCheckout.style.opacity = "0.5";
            btnCheckout.style.cursor = "not-allowed";
        }
    } else {
        if (btnCheckout) {
            btnCheckout.disabled = false;
            btnCheckout.style.opacity = "1";
            btnCheckout.style.cursor = "pointer";
        }
    }
}

async function agregarAlCarrito(varianteId, cantidad = 1, productoInfo = {}) {
    if (!esUsuarioLogueado()) {
        let guestCart = obtenerGuestCart();
        const itemExistente = guestCart.find(i => i.varianteId === varianteId);

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            guestCart.push({
                cartItemId: Date.now(),
                varianteId: varianteId,
                productoNombre: productoInfo.nombre || "Prenda Exclusiva",
                productoPrecio: productoInfo.precio || 0,
                talle: productoInfo.talle || "Única",
                colorHex: productoInfo.colorHex || "#000000",
                imagen: productoInfo.imagen || "/Imagenes/Logo.png",
                cantidad: cantidad
            });
        }

        guardarGuestCart(guestCart);
        actualizarBadgeHeaderGlobal();
        alert("🛒 ¡Producto agregado al carrito con éxito!");
        return;
    }

    const userId = obtenerUserIdActivo();
    try {
        const respuesta = await fetch(`${API_BASE_URL}/cart/items?userId=${userId}&varianteId=${varianteId}&cantidad=${cantidad}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!respuesta.ok) {
            const errorTexto = await respuesta.text();
            throw new Error(errorTexto || "No se pudo agregar el producto al carrito");
        }

        alert("¡Producto agregado al carrito con éxito!");
        if (typeof actualizarContadorHeaderGlobal === 'function') {
            await actualizarContadorHeaderGlobal(userId);
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        alert("Error: " + error.message);
    }
}

function vincularEventosCarrito(userId) {
    const cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach(item => {
        const btnRestar = item.querySelector(".btn-restar");
        const contadorNumero = item.querySelector(".qty-picker span");
        const btnSumar = item.querySelector(".btn-sumar");
        const btnEliminar = item.querySelector(".btn-delete");
        const cartItemId = item.dataset.cartItemId;

        if (btnSumar && contadorNumero) {
            btnSumar.addEventListener("click", async () => {
                let cant = parseInt(contadorNumero.textContent) || 1;
                cant++;
                contadorNumero.textContent = cant;
                await sincronizarCantidadBackend(userId, cartItemId, cant);
                cargarCarritoDinamico(userId);
            });
        }

        if (btnRestar && contadorNumero) {
            btnRestar.addEventListener("click", async () => {
                let cant = parseInt(contadorNumero.textContent) || 1;
                if (cant > 1) {
                    cant--;
                    contadorNumero.textContent = cant;
                    await sincronizarCantidadBackend(userId, cartItemId, cant);
                    cargarCarritoDinamico(userId);
                }
            });
        }

        if (btnEliminar) {
            btnEliminar.addEventListener("click", async () => {
                const tituloProducto = item.querySelector(".item-title")?.textContent || "Producto";

                item.style.transition = "all 0.4s ease";
                item.style.opacity = "0";
                item.style.transform = "translateX(-30px)";

                setTimeout(async () => {
                    item.remove();
                    alert(`🗑️ "${tituloProducto}" fue removido de tu carrito.`);
                    await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}`, { method: 'DELETE' });
                    cargarCarritoDinamico(userId);
                }, 400);
            });
        }
    });

    configurarBotonCheckout();
}

function vincularEventosCarritoInvitado() {
    const cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach(item => {
        const btnRestar = item.querySelector(".btn-restar");
        const contadorNumero = item.querySelector(".qty-picker span");
        const btnSumar = item.querySelector(".btn-sumar");
        const btnEliminar = item.querySelector(".btn-delete");
        const cartItemId = parseInt(item.dataset.cartItemId);

        if (btnSumar && contadorNumero) {
            btnSumar.addEventListener("click", () => {
                let cart = obtenerGuestCart();
                const prod = cart.find(i => i.cartItemId === cartItemId);
                if (prod) {
                    prod.cantidad++;
                    guardarGuestCart(cart);
                    cargarCarritoDinamico(null);
                }
            });
        }

        if (btnRestar && contadorNumero) {
            btnRestar.addEventListener("click", () => {
                let cart = obtenerGuestCart();
                const prod = cart.find(i => i.cartItemId === cartItemId);
                if (prod && prod.cantidad > 1) {
                    prod.cantidad--;
                    guardarGuestCart(cart);
                    cargarCarritoDinamico(null);
                }
            });
        }

        if (btnEliminar) {
            btnEliminar.addEventListener("click", () => {
                const tituloProducto = item.querySelector(".item-title")?.textContent || "Producto";
                item.style.transition = "all 0.4s ease";
                item.style.opacity = "0";
                item.style.transform = "translateX(-30px)";

                setTimeout(() => {
                    let cart = obtenerGuestCart().filter(i => i.cartItemId !== cartItemId);
                    guardarGuestCart(cart);
                    alert(`🗑️ "${tituloProducto}" fue removido de tu carrito.`);
                    cargarCarritoDinamico(null);
                }, 400);
            });
        }
    });

    configurarBotonCheckout();
}

function configurarBotonCheckout() {
    const btnCheckout = document.querySelector(".btn-checkout");
    if (btnCheckout) {
        btnCheckout.replaceWith(btnCheckout.cloneNode(true));
        const nuevoBtnCheckout = document.querySelector(".btn-checkout");
        if (nuevoBtnCheckout) {
            nuevoBtnCheckout.addEventListener("click", () => {
                if (!esUsuarioLogueado()) {
                    alert("⚠️ Por favor, iniciá sesión o registrate para continuar con el pago.");
                    window.location.href = "login";
                    return;
                }

                sessionStorage.setItem("origenCompra", "carrito");
                sessionStorage.removeItem("checkoutDirecto");
                window.location.href = "checkout";
            });
        }
    }
}

async function sincronizarCantidadBackend(userId, cartItemId, nuevaCantidad) {
    try {
        await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}&nuevaCantidad=${nuevaCantidad}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Error sincronizando cantidad:", e);
    }
}


async function verificarProductosEnCarrito() {
    const esIndexPage = document.querySelector(".product-card") || window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    if (!esIndexPage) return;

    let variantesEnCarrito = [];

    if (!esUsuarioLogueado()) {
        const guestCart = obtenerGuestCart();
        variantesEnCarrito = guestCart.map(i => parseInt(i.varianteId)).filter(Boolean);
    } else {
        const userId = obtenerUserIdActivo();
        try {
            const respuesta = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
            if (!respuesta.ok) return;
            const carritoBD = await respuesta.json();
            const itemsEnCarrito = carritoBD.items || [];
            variantesEnCarrito = itemsEnCarrito.map(item => item.variante?.id).filter(Boolean);
        } catch (error) {
            console.error("Error al verificar productos en el carrito:", error);
            return;
        }
    }

    document.querySelectorAll(".product-card").forEach(card => {
        const varianteId = parseInt(card.dataset.varianteId);
        const btnAgregar = card.querySelector(".btn-agregar");

        if (btnAgregar && variantesEnCarrito.includes(varianteId)) {
            btnAgregar.disabled = true;
            btnAgregar.textContent = "Ya en el carrito";
            btnAgregar.style.backgroundColor = "#ccc";
            btnAgregar.style.cursor = "not-allowed";
        }
    });
}