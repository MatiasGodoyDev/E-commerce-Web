document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:8080/api';

    const fotoPrincipal = document.getElementById("foto-principal");
    const miniaturas = document.querySelectorAll(".miniatura");
    const textoColor = document.getElementById("color-seleccionado");
    const textoTalle = document.getElementById("talle-seleccionado");

    const contenedorColores = document.querySelector(".opciones-colores");
    const contenedorTalles = document.querySelector(".opciones-talles");
    const textoStock = document.getElementById("stock-texto");

    const btnRestar = document.getElementById("btn-restar");
    const btnSumar = document.getElementById("btn-sumar");
    const numeroCantidad = document.getElementById("cantidad-numero");

    const btnCarrito = document.getElementById("btn-agregar-carrito");
    const btnComprar = document.getElementById("btn-comprar");

    const mainContainer = document.querySelector(".producto-detalle-container");
    const productoId = mainContainer ? mainContainer.dataset.productoId : null;

    let variantesGlobales = [];
    let colorSeleccionado = null;
    let talleSeleccionado = null;
    let cantidadActual = 1;
    let varianteActiva = null;

    function obtenerUserIdActivo() {
        const userSession = JSON.parse(localStorage.getItem("userSession") || "{}");
        return userSession.id || userSession.userId || localStorage.getItem("userId") || 1;
    }

    async function cargarVariantesProducto() {
        if (!productoId) return;
        try {
            const response = await fetch(`${baseUrl}/products/${productoId}`);
            if (response.ok) {
                const data = await response.json();
                variantesGlobales = data.variantes || [];
                inicializarBotonesDinamicos();
            }
        } catch (error) {
            console.error("Error al obtener las variantes del producto:", error);
        }
    }

    function inicializarBotonesDinamicos() {
        if (variantesGlobales.length === 0) return;

        const coloresUnicos = [...new Map(variantesGlobales.map(v => [v.color.toLowerCase(), v])).values()];
        const tallesUnicos = [...new Set(variantesGlobales.map(v => v.talle.toUpperCase()))];

        if (contenedorColores) {
            contenedorColores.innerHTML = '';
            coloresUnicos.forEach((v, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `color-circulo ${index === 0 ? 'activo' : ''}`;
                btn.style.backgroundColor = v.colorHex || '#000';
                btn.setAttribute('data-color', v.color);
                btn.title = v.color;

                if (index === 0) {
                    colorSeleccionado = v.color;
                    if (textoColor) textoColor.textContent = v.color;
                }

                btn.addEventListener('click', () => {
                    document.querySelectorAll('.color-circulo').forEach(b => b.classList.remove('activo'));
                    btn.classList.add('activo');
                    colorSeleccionado = v.color;
                    if (textoColor) textoColor.textContent = v.color;
                    actualizarDisponibilidadYStock();
                });

                contenedorColores.appendChild(btn);
            });
        }

        if (contenedorTalles) {
            contenedorTalles.innerHTML = '';
            tallesUnicos.forEach((talle, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `talle-boton ${index === 0 ? 'activo' : ''}`;
                btn.textContent = talle;

                if (index === 0) {
                    talleSeleccionado = talle;
                    if (textoTalle) textoTalle.textContent = talle;
                }

                btn.addEventListener('click', () => {
                    if (btn.classList.contains('disabled')) return;
                    document.querySelectorAll('.talle-boton').forEach(b => b.classList.remove('activo'));
                    btn.classList.add('activo');
                    talleSeleccionado = talle;
                    if (textoTalle) textoTalle.textContent = talle;
                    actualizarDisponibilidadYStock();
                });

                contenedorTalles.appendChild(btn);
            });
        }

        actualizarDisponibilidadYStock();
    }

    function actualizarDisponibilidadYStock() {
        const botonesTalle = document.querySelectorAll('.talle-boton');

        botonesTalle.forEach(btn => {
            const talleText = btn.textContent.trim().toUpperCase();

            const varianteEncontrada = variantesGlobales.find(v =>
                v.color.toLowerCase() === colorSeleccionado?.toLowerCase() &&
                v.talle.toUpperCase() === talleText
            );

            if (!varianteEncontrada || varianteEncontrada.stock <= 0) {
                btn.classList.add('disabled');
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';

                if (talleSeleccionado === talleText) {
                    talleSeleccionado = null;
                    if (textoTalle) textoTalle.textContent = "Seleccionar";
                    btn.classList.remove('activo');
                }
            } else {
                btn.classList.remove('disabled');
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });

        varianteActiva = variantesGlobales.find(v =>
            v.color.toLowerCase() === colorSeleccionado?.toLowerCase() &&
            v.talle.toUpperCase() === talleSeleccionado?.toUpperCase()
        );

        if (varianteActiva) {
            if (textoStock) textoStock.textContent = `(${varianteActiva.stock} unidades disponibles)`;
            if (cantidadActual > varianteActiva.stock) {
                cantidadActual = Math.max(1, varianteActiva.stock);
                if (numeroCantidad) numeroCantidad.textContent = cantidadActual;
            }
        } else {
            if (textoStock) textoStock.textContent = "(Combinación sin stock)";
        }
    }

    miniaturas.forEach(miniatura => {
        miniatura.addEventListener("click", (e) => {
            if (fotoPrincipal) {
                fotoPrincipal.src = e.target.src;
                fotoPrincipal.alt = e.target.alt;
            }
            miniaturas.forEach(img => img.classList.remove("activa"));
            e.target.classList.add("activa");
        });
    });

    if (btnSumar && btnRestar && numeroCantidad) {
        btnSumar.addEventListener("click", () => {
            if (!varianteActiva) {
                alert("⚠️ Seleccioná un talle y color válidos.");
                return;
            }
            if (cantidadActual < varianteActiva.stock) {
                cantidadActual++;
                numeroCantidad.textContent = cantidadActual;
            } else {
                alert(`⚠️ Solo hay ${varianteActiva.stock} unidades disponibles.`);
            }
        });

        btnRestar.addEventListener("click", () => {
            if (cantidadActual > 1) {
                cantidadActual--;
                numeroCantidad.textContent = cantidadActual;
            }
        });
    }

    if (btnCarrito) {
        btnCarrito.addEventListener("click", async () => {
            if (!varianteActiva) {
                alert("⚠️ Por favor, elegí un talle y un color con stock.");
                return;
            }

            const userId = obtenerUserIdActivo();
            const varianteId = varianteActiva.id;

            try {
                const respuestaCart = await fetch(`${baseUrl}/cart?userId=${userId}`);
                if (!respuestaCart.ok) throw new Error("No se pudo obtener el carrito.");

                const carritoBD = await respuestaCart.json();
                const resItems = await fetch(`${baseUrl}/cart/items/${carritoBD.id}`);
                const itemsDetallados = resItems.ok ? await resItems.json() : (carritoBD.items || []);

                const itemEnCarrito = itemsDetallados.find(i =>
                    Number(i.varianteId) === Number(varianteId) || Number(i.variante?.id) === Number(varianteId)
                );

                const cantidadActualEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
                const totalDeseado = cantidadActualEnCarrito + cantidadActual;

                if (totalDeseado > varianteActiva.stock) {
                    alert(`⚠️ No se puede agregar. Solo hay ${varianteActiva.stock} unidades disponibles en stock y ya tenés ${cantidadActualEnCarrito} en tu carrito.`);
                    return;
                }

                if (itemEnCarrito) {
                    const cartItemId = itemEnCarrito.cartItemId || itemEnCarrito.id;
                    const responsePut = await fetch(`${baseUrl}/cart/items/${cartItemId}?userId=${userId}&nuevaCantidad=${totalDeseado}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!responsePut.ok) throw new Error("No se pudo actualizar la cantidad en el carrito.");
                    alert(`🛒 ¡Cantidad actualizada en el carrito!\nCombinación: ${talleSeleccionado} / ${colorSeleccionado}\nTotal en carrito: ${totalDeseado}`);
                } else {
                    const responsePost = await fetch(`${baseUrl}/cart/items?userId=${userId}&varianteId=${varianteId}&cantidad=${cantidadActual}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!responsePost.ok) {
                        const errorText = await responsePost.text();
                        throw new Error(errorText || "Verificá el stock.");
                    }
                    alert(`🛒 ¡Agregado al carrito!\nCombinación: ${talleSeleccionado} / ${colorSeleccionado}\nCantidad: ${cantidadActual}`);
                }

                if (typeof actualizarContadorHeaderGlobal === 'function') {
                    await actualizarContadorHeaderGlobal(userId);
                }

            } catch (error) {
                console.error("Error al agregar al carrito:", error);
                alert(`❌ No se pudo agregar al carrito: ${error.message}`);
            }
        });
    }

    if (btnComprar) {
        btnComprar.addEventListener("click", () => {
            if (!varianteActiva) {
                alert("⚠️ Por favor, seleccioná un talle y un color disponibles antes de continuar.");
                return;
            }

            const precioReal = varianteActiva.precio || parseFloat(document.querySelector("#precio-producto")?.textContent?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
            const nombreProducto = document.querySelector("h1")?.textContent || document.querySelector(".producto-titulo")?.textContent || "Producto";
            const urlParams = new URLSearchParams(window.location.search);
            const idProductoActual = urlParams.get('id');
            const itemDirecto = [{
                productoId: Number(idProductoActual),
                varianteId: varianteActiva.id,
                cantidad: cantidadActual,
                productoNombre: nombreProducto.trim(),
                productoPrecio: precioReal,
                talle: talleSeleccionado,
                color: colorSeleccionado,
                subtotal: precioReal * cantidadActual
            }];

            sessionStorage.setItem("checkoutDirecto", JSON.stringify(itemDirecto));

            sessionStorage.setItem("origenCompra", "individual");

            window.location.href = 'checkout';
        });
    }
    const btnWishlistDetalle = document.getElementById("btn-favorito") || document.querySelector(".btn-corazon");
    const wishlistBadge = document.getElementById('wishlist-count');

    if (btnWishlistDetalle) {
        btnWishlistDetalle.addEventListener("click", async (e) => {
            e.stopPropagation();

            const userId = obtenerUserIdActivo();
            if (!userId) {
                alert("Debes iniciar sesión para gestionar tus favoritos.");
                window.location.href = '/login';
                return;
            }

            if (!productoId) return;

            const isNowActive = btnWishlistDetalle.classList.toggle('active');

            try {
                if (isNowActive) {
                    await fetch(`${baseUrl}/wishlist?userId=${userId}&productoId=${productoId}`, { method: 'POST' });
                } else {
                    await fetch(`${baseUrl}/wishlist?userId=${userId}&productoId=${productoId}`, { method: 'DELETE' });
                }
            } catch (error) {
                console.error("Error al actualizar favoritos:", error);
            }

            if (wishlistBadge) {
                let currentWishlist = parseInt(wishlistBadge.textContent) || 0;
                currentWishlist = isNowActive ? currentWishlist + 1 : Math.max(0, currentWishlist - 1);

                wishlistBadge.textContent = currentWishlist;
                wishlistBadge.classList.toggle('visible', currentWishlist > 0);
                wishlistBadge.classList.remove('bump');
                void wishlistBadge.offsetWidth;
                wishlistBadge.classList.add('bump');
            }
        });
    }

    const linkGuiaOriginal = document.querySelector(".selector-grupo a");

    if (linkGuiaOriginal) {
        const modalHTML = `
            <div id="modal-guia-talles" class="modal-guia-talles" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div class="modal-contenido" style="background: #fff; padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <span id="cerrar-guia" style="position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; font-weight: bold;">&times;</span>
                    
                    <div class="header-guia" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Guía de Talles</h3>
                        <div class="unidad-toggle" style="background: #f0f0f0; border-radius: 20px; padding: 3px; display: flex; align-items: center;">
                            <button type="button" class="unidad-btn activo" data-unidad="cm" style="border: none; background: #000; color: #fff; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-size: 12px;">CM</button>
                            <span style="margin: 0 5px; color: #888;">|</span>
                            <button type="button" class="unidad-btn" data-unidad="in" style="border: none; background: transparent; color: #333; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-size: 12px;">IN</button>
                        </div>
                    </div>

                    <div id="tabla-talles-container" style="overflow-x: auto; margin-bottom: 15px;">
                        <!-- Tabla inyectada dinámicamente -->
                    </div>

                    <p class="aviso-medidas" style="font-size: 11px; color: #666; margin: 0;">*Estos datos se obtuvieron de la medición manual del producto, las mediciones pueden variar de 1-2 CM.</p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalGuia = document.getElementById("modal-guia-talles");
        const cerrarGuia = document.getElementById("cerrar-guia");
        let unidadActual = 'cm';

        linkGuiaOriginal.addEventListener("click", (e) => {
            e.preventDefault();
            modalGuia.style.display = "flex";
            renderizarTablaDinamica();
        });

        if (cerrarGuia) {
            cerrarGuia.addEventListener("click", () => {
                modalGuia.style.display = "none";
            });
        }

        window.addEventListener("click", (e) => {
            if (e.target === modalGuia) {
                modalGuia.style.display = "none";
            }
        });

        const botonesUnidad = modalGuia.querySelectorAll(".unidad-btn");
        botonesUnidad.forEach(btn => {
            btn.addEventListener("click", () => {
                botonesUnidad.forEach(b => {
                    b.classList.remove("activo");
                    b.style.background = "transparent";
                    b.style.color = "#333";
                });
                btn.classList.add("activo");
                btn.style.background = "#000";
                btn.style.color = "#fff";

                unidadActual = btn.getAttribute("data-unidad");
                renderizarTablaDinamica();
            });
        });

        function renderizarTablaDinamica() {
            const contenedor = document.getElementById("tabla-talles-container");
            if (!contenedor) return;

            const medidasMuestra = variantesGlobales.length > 0
                ? variantesGlobales.map(v => ({ talle: v.talle, pecho: 100, largo: 60 }))
                : [
                    { talle: 'XS', pecho: 100, largo: 55.5 },
                    { talle: 'S', pecho: 104, largo: 56.5 },
                    { talle: 'M', pecho: 108, largo: 57.5 },
                    { talle: 'L', pecho: 114, largo: 59.0 }
                ];

            let htmlTabla = `
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px;">
                    <thead>
                        <tr style="background: #f9f9f9; border-bottom: 2px solid #ddd;">
                            <th style="padding: 10px;">TALLA</th>
                            <th style="padding: 10px;">PECHO (${unidadActual.toUpperCase()})</th>
                            <th style="padding: 10px;">LARGO (${unidadActual.toUpperCase()})</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            medidasMuestra.forEach(item => {
                let pechoValor = item.pecho;
                let largoValor = item.largo;

                if (unidadActual === 'in') {
                    pechoValor = (pechoValor / 2.54).toFixed(1);
                    largoValor = (largoValor / 2.54).toFixed(1);
                }

                htmlTabla += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold;">${item.talle}</td>
                        <td style="padding: 10px;">${pechoValor}</td>
                        <td style="padding: 10px;">${largoValor}</td>
                    </tr>
                `;
            });

            htmlTabla += `</tbody></table>`;
            contenedor.innerHTML = htmlTabla;
        }
    }




    cargarVariantesProducto();
});
