document.addEventListener("DOMContentLoaded", () => {
    const userSessionRaw = localStorage.getItem('userSession');
    if (!userSessionRaw) {
        alert("⚠️ Debes iniciar sesión para ver tu perfil.");
        window.location.href = '/login';
        throw new Error("No authenticated session");
    }

    let user;
    try {
        user = JSON.parse(userSessionRaw);
    } catch (e) {
        console.error("Error parseando userSession:", e);
        localStorage.removeItem('userSession');
        window.location.href = '/login';
        throw new Error("Malformed session JSON");
    }

    const userId = user.id || user.userId || user.usuarioId;
    if (!userId) {
        console.error("El objeto de sesión no contiene un ID válido:", user);
        localStorage.removeItem('userSession');
        window.location.href = '/login';
        throw new Error("Invalid session ID");
    }

    console.log("Perfil cargado para el ID real:", userId);

    const elSidebarNombre = document.getElementById("sidebar-nombre");
    const elSidebarAvatar = document.getElementById("sidebar-iniciales");
    const formDatos = document.getElementById("form-datos-personales");
    const formDirecciones = document.getElementById("form-direccion");

    function precargarDatosUsuario() {
        if (elSidebarNombre) {
            elSidebarNombre.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';
        }
        if (elSidebarAvatar) {
            elSidebarAvatar.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        }

        const inputNombre = document.getElementById("nombre");
        const inputApellido = document.getElementById("apellido");
        const inputEmail = document.getElementById("email");
        const inputCalle = document.getElementById("calle-perfil");
        const inputEspecificaciones = document.getElementById("especificaciones-perfil");
        const inputCp = document.getElementById("codPostal-perfil");

        if (inputNombre) inputNombre.value = user.nombre || '';
        if (inputApellido) inputApellido.value = user.apellido || '';
        if (inputEmail) inputEmail.value = user.email || '';
        if (inputCalle) inputCalle.value = user.direccionCasa || '';
        if (inputEspecificaciones) inputEspecificaciones.value = user.piso || user.especificacionesCasa || '';
        if (inputCp) inputCp.value = user.codPostal || '';
    }

    precargarDatosUsuario();

    const menuBtns = document.querySelectorAll(".menu-btn[data-tab]");
    menuBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");

            document.querySelectorAll(".tab-seccion").forEach(sec => sec.classList.add("oculto"));

            const targetTab = btn.getAttribute("data-tab");
            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.remove("oculto");
            }
        });
    });

    const btnLogout = document.querySelector(".menu-link-salir");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("userSession");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
        });
    }

    window.addEventListener('storageSessionUpdated', () => {
        const sessionActualizada = JSON.parse(localStorage.getItem('userSession'));
        if (sessionActualizada) {
            user = sessionActualizada;
            precargarDatosUsuario();
        }
    });

    if (formDatos) {
        formDatos.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombreVal = document.getElementById("nombre")?.value.trim() || '';
            const apellidoVal = document.getElementById("apellido")?.value.trim() || '';
            const passwordNueva = document.getElementById("password-nueva") ? document.getElementById("password-nueva").value : '';

            const payload = {
                nombre: nombreVal,
                apellido: apellidoVal
            };
            if (passwordNueva.trim() !== '') {
                payload.password = passwordNueva;
            }

            try {
                console.log(`Enviando PUT datos a: ${API_BASE_URL}/users/${userId}`);
                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const textRes = await response.text();
                if (!response.ok) throw new Error(`Error ${response.status}: ${textRes || 'en el servidor'}`);

                let usuarioActualizado = { ...user, ...payload };
                if (textRes && textRes.trim().startsWith("{")) {
                    try {
                        const parsed = JSON.parse(textRes);
                        usuarioActualizado = { ...user, ...parsed };
                    } catch (parseErr) {
                        console.warn("La respuesta no era un JSON válido, usando payload local:", parseErr);
                    }
                }

                user = { ...user, ...usuarioActualizado };
                localStorage.setItem('userSession', JSON.stringify(user));
                window.dispatchEvent(new Event('storageSessionUpdated'));

                if (document.getElementById("password-nueva")) document.getElementById("password-nueva").value = '';
                alert(`👤 Datos actualizados con éxito en el servidor.`);
            } catch (err) {
                console.error("Catch error datos:", err);
                alert(`❌ No se pudieron guardar los cambios: ${err.message}`);
            }
        });
    }

    if (formDirecciones) {
        formDirecciones.addEventListener("submit", async (e) => {
            e.preventDefault();

            const direccionVal = document.getElementById("calle-perfil")?.value.trim() || '';
            const pisoVal = document.getElementById("especificaciones-perfil")?.value.trim() || '';
            const cpVal = document.getElementById("codPostal-perfil")?.value.trim() || '';

            const payload = {
                direccionCasa: direccionVal,
                piso: pisoVal,
                codPostal: cpVal
            };

            try {
                console.log(`Enviando PUT dirección a: ${API_BASE_URL}/users/${userId}/address`);
                const response = await fetch(`${API_BASE_URL}/users/${userId}/address`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const textRes = await response.text();
                if (!response.ok) throw new Error(`Error ${response.status}: ${textRes || 'en el servidor'}`);

                let usuarioActualizado = { ...user, ...payload };
                if (textRes && textRes.trim().startsWith("{")) {
                    try {
                        const parsed = JSON.parse(textRes);
                        usuarioActualizado = { ...user, ...parsed };
                    } catch (parseErr) {
                        console.warn("La respuesta de dirección no era un JSON válido, usando payload local:", parseErr);
                    }
                }

                user = { ...user, ...usuarioActualizado };
                localStorage.setItem('userSession', JSON.stringify(user));
                window.dispatchEvent(new Event('storageSessionUpdated'));

                alert(`📍 Dirección de envío actualizada con éxito.`);
            } catch (err) {
                console.error("Catch error dirección:", err);
                alert(`❌ Error al actualizar dirección: ${err.message}`);
            }
        });
    }
});

async function cargarHistorialCompras(userId) {
    const contenedorCompras = document.getElementById("contenedor-compras");
    if (!contenedorCompras) return;

    contenedorCompras.innerHTML = `<p style="text-align: center; color: #777; padding: 2rem;">Cargando tus compras...</p>`;

    try {
        const [respuestaOrdenes, respuestaProductos] = await Promise.all([
            fetch(`${API_BASE_URL}/orders/historial?userId=${userId}`),
            fetch(`${API_BASE_URL}/products`)
        ]);

        if (!respuestaOrdenes.ok) throw new Error("No se pudo obtener el historial de compras.");

        const ordenes = await respuestaOrdenes.json();
        const todosLosProductos = respuestaProductos.ok ? await respuestaProductos.json() : [];

        if (!ordenes || ordenes.length === 0) {
            contenedorCompras.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #777;">
                    <p style="font-size: 1.1rem; margin-bottom: 1rem;">📦 Todavía no realizaste ninguna compra.</p>
                    <a href="/index" style="color: #000; font-weight: bold; text-decoration: underline;">Ir a la tienda</a>
                </div>
            `;
            return;
        }

        ordenes.forEach(orden => {
            if (orden.items) {
                orden.items.forEach(item => {
                    const varianteId = item.variante?.id;
                    if (varianteId && todosLosProductos.length > 0) {
                        const productoEncontrado = todosLosProductos.find(p =>
                            p.variantes && p.variantes.some(v => v.id === varianteId)
                        );
                        if (productoEncontrado) {
                            item.nombreProductoEnJS = productoEncontrado.nombre;
                        }
                    }
                });
            }
        });

        contenedorCompras.innerHTML = ordenes.map((orden, index) => {
            const numeroPedidoRelativo = index + 1;
            const fechaFormateada = orden.fechaCompra ? new Date(orden.fechaCompra).toLocaleDateString() : 'Fecha reciente';
            const estadoClase = orden.estado === 'PENDIENTE' ? 'badge-pendiente' : 'badge-completado';

            const itemsHtml = (orden.items || []).map(item => {
                const nombreProd = item.nombreProductoEnJS || item.variante?.producto?.nombre || item.nombreProducto || 'Prenda';
                const talle = item.variante?.talle || item.talle || 'Única';
                const color = item.variante?.color || item.color || '';
                const cantidad = item.cantidad || 1;

                const detalleVariante = [talle, color].filter(Boolean).join(' - ');

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.9rem;">
                        <span>• ${nombreProd} (${detalleVariante}) x ${cantidad}</span>
                        <span>$${parseFloat(item.precioUnitarioConDescuento || item.precio || 0).toFixed(2)}</span>
                    </div>
                `;
            }).join('');

            return `
                <div class="compra-card" style="border: 1px solid #e1e1e1; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: #fff;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                        <div>
                            <strong>Pedido #${numeroPedidoRelativo}</strong>
                            <span style="display: block; font-size: 0.85rem; color: #666;">Fecha: ${fechaFormateada}</span>
                        </div>
                        <div>
                            <span class="${estadoClase}" style="padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background: #e2e8f0;">${orden.estado}</span>
                        </div>
                    </div>
                    <div class="compra-items" style="margin-bottom: 10px;">
                        ${itemsHtml}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; font-weight: bold;">
                        <span>Total abonado:</span>
                        <span style="font-size: 1.1rem;">$${parseFloat(orden.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error cargando historial:", error);
        contenedorCompras.innerHTML = `<p style="color: red; text-align: center;">Error al cargar tus compras.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const currentUserId = userSession.id || userSession.userId || userSession.usuarioId;

    if (!currentUserId) return;

    const seccionHistorial = document.getElementById("tab-historial");
    if (seccionHistorial && !seccionHistorial.classList.contains("oculto")) {
        cargarHistorialCompras(currentUserId);
    }

    const menuBtns = document.querySelectorAll(".menu-btn[data-tab]");
    menuBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            if (targetTab === "historial") {
                cargarHistorialCompras(currentUserId);
            }
        });
    });
});