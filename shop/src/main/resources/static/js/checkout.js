document.addEventListener("DOMContentLoaded", () => {

    const cardEnvio = document.getElementById("card-envio");
    const cardPago = document.getElementById("card-pago");
    const btnAtrasEnvio = document.getElementById("btn-atras");
    const btnEnviarEnvio = document.getElementById("btn-enviar-envio");
    const btnVolverEnvio = document.getElementById("btn-volver-envio");
    const btnFinalizar = document.getElementById("btn-finalizar-compra");

    const btnNuevaDireccion = document.getElementById("btn-nueva-direccion");
    const seccionNuevaDir = document.getElementById("seccion-nueva-dir");
    const btnCancelarDir = document.getElementById("btn-cancelar-dir");
    const radiosDireccion = document.getElementsByName("opcion-direccion");
    const contenedorDireccionesGrid = document.querySelector(" .direcciones-grid");

    const radiosPago = document.getElementsByName("metodo-pago");
    const formularioTarjeta = document.getElementById("formulario-tarjeta");
    const seccionCuotas = document.getElementById("seccion-cuotas");
    const seccionQr = document.getElementById("seccion-qr");
    const seccionEfectivo = document.getElementById("seccion-efectivo");
    const tituloRedEfectivo = document.getElementById("titulo-red-efectivo");

    const inputNumeroTarjeta = document.getElementById("numero-tarjeta");
    const labelTipoTarjeta = document.getElementById("tipo-tarjeta-detectada");
    const iconoTarjetaMarca = document.getElementById("icono-tarjeta-marca");
    const selectCuotas = document.getElementById("select-cuotas");
    const textoResumenCuotas = document.getElementById("resumen-cuotas-texto");


    const inputCalle = document.getElementById("calle");
    const inputEspecificaciones = document.getElementById("especificaciones");
    const inputCodPostal = document.getElementById("codPostal");
    const inputDireccionSeleccionada = document.getElementById("direccion-seleccionada");
    const inputCodPostalOculto = document.getElementById("cod-postal");


    const contenedorSummaryItems = document.getElementById("summary-items-container");
    const textoCantidadProductos = document.getElementById("cantidad-productos-texto");
    const textoSubtotal = document.getElementById("subtotal-texto");
    const textoTotalFinal = document.getElementById("total-final-texto");
    const btnToggleProductos = document.getElementById("btn-toggle-productos");


    let subtotalBase = 0;
    let marcaDetectada = "GENERICA";
    let mostrarTodos = false;
    let carritoProductos = [];


    const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '/api';


    const userIdActual = localStorage.getItem("userId") || localStorage.getItem("idUsuario");
    const esInvitado = !userIdActual || Number(userIdActual) === 2;

    if (esInvitado) {
        if (contenedorDireccionesGrid) {
            contenedorDireccionesGrid.style.display = "none";
        }
        if (seccionNuevaDir) {
            seccionNuevaDir.classList.remove("oculto");
        }
        radiosDireccion.forEach(radio => {
            if (radio.value === "nueva") radio.checked = true;
            else radio.checked = false;
        });
    } else {
        cargarDatosUsuario(userIdActual);
    }


    async function cargarDatosUsuario(userId) {
        try {
            console.log(`👤 Cargando perfil y datos para el usuario ID: ${userId}`);
            const response = await fetch(`${baseUrl}/users/${userId}`);

            if (!response.ok) {
                throw new Error("No se pudo obtener la información del usuario.");
            }

            const userData = await response.json();
            console.log("📦 JSON COMPLETO del usuario recibido:", userData);


            const calleCasa = userData.direccionCasa || userData.direccion || userData.calle || "";
            const pisoCasa = userData.pisoDepto || userData.especificaciones || userData.piso || "";
            const cpCasa = userData.codigoPostal || userData.codPostal || userData.postalCode || "0000";

            if (calleCasa && contenedorDireccionesGrid) {
                console.log("✅ ¡Dirección principal encontrada! Agregándola al grid junto con la opción de nueva dirección...");


                contenedorDireccionesGrid.style.display = "grid";

                contenedorDireccionesGrid.innerHTML = `
                    <!-- Opción 1: Dirección guardada en el perfil -->
                    <div class="direccion-card checked">
                        <label style="cursor: pointer; display: block; width: 100%;">
                            <input type="radio" name="opcion-direccion" value="registrada-principal" checked data-calle="${calleCasa}" data-cp="${cpCasa}" data-esp="${pisoCasa}">
                            <span style="color: green; font-size: 0.8rem; display: block; font-weight: bold;">Dirección Principal (Perfil)</span>
                            <strong style="font-size: 1rem; color: #333;">${calleCasa}</strong>
                            ${pisoCasa ? `<br><span style="color: #666; font-size: 0.85rem;">${pisoCasa}</span>` : ""}
                            <br><span style="color: #666; font-size: 0.85rem;">C.P: ${cpCasa}</span>
                        </label>
                    </div>

                    <!-- Opción 2: Elegir ingresar una nueva dirección -->
                    <div class="direccion-card">
                        <label style="cursor: pointer; display: block; width: 100%;">
                            <input type="radio" name="opcion-direccion" value="nueva">
                            <strong style="font-size: 1rem; color: #333;">➕ Agregar otra dirección</strong>
                            <br><span style="color: #666; font-size: 0.85rem;">Enviar a un domicilio diferente</span>
                        </label>
                    </div>
                `;


                if (seccionNuevaDir) {
                    seccionNuevaDir.classList.add("oculto");
                }


                if (inputDireccionSeleccionada) {
                    inputDireccionSeleccionada.value = pisoCasa ? `${calleCasa}, ${pisoCasa}` : calleCasa;
                }
                if (inputCodPostalOculto) {
                    inputCodPostalOculto.value = cpCasa;
                }


                const radiosActualizados = document.getElementsByName("opcion-direccion");
                radiosActualizados.forEach(radio => {
                    radio.addEventListener("change", (e) => {

                        radiosActualizados.forEach(r => r.closest(".direccion-card")?.classList.remove("checked"));
                        e.target.closest(".direccion-card")?.classList.add("checked");

                        if (e.target.value === "registrada-principal") {

                            if (seccionNuevaDir) seccionNuevaDir.classList.add("oculto");

                            if (inputDireccionSeleccionada) {
                                const c = e.target.dataset.calle || "";
                                const esp = e.target.dataset.esp || "";
                                inputDireccionSeleccionada.value = esp ? `${c}, ${esp}` : c;
                            }
                            if (inputCodPostalOculto) {
                                inputCodPostalOculto.value = e.target.dataset.cp || "0000";
                            }

                        } else if (e.target.value === "nueva") {

                            if (seccionNuevaDir) seccionNuevaDir.classList.remove("oculto");


                            if (inputDireccionSeleccionada) inputDireccionSeleccionada.value = "";
                            if (inputCodPostalOculto) inputCodPostalOculto.value = "";
                        }
                    });
                });

            } else {
                console.warn("⚠️ El usuario no tiene dirección en el perfil. Mostrando formulario manual directo.");
                if (contenedorDireccionesGrid) contenedorDireccionesGrid.style.display = "none";
                if (seccionNuevaDir) seccionNuevaDir.classList.remove("oculto");
            }

        } catch (error) {
            console.error("❌ Error al cargar datos del usuario registrado:", error);
            if (seccionNuevaDir) seccionNuevaDir.classList.remove("oculto");
        }
    }



    if (btnEnviarEnvio) {
        btnEnviarEnvio.addEventListener("click", () => {
            cardEnvio.classList.add("oculto");
            cardPago.classList.remove("oculto");
        });
    }

    if (btnVolverEnvio) {
        btnVolverEnvio.addEventListener("click", () => {
            cardPago.classList.add("oculto");
            cardEnvio.classList.remove("oculto");
        });
    }

    if (btnAtrasEnvio) {
        btnAtrasEnvio.addEventListener("click", () => {
            sessionStorage.removeItem("checkoutDirecto");
            window.location.href = "index.html";
        });
    }


    if (btnNuevaDireccion) {
        btnNuevaDireccion.addEventListener("click", () => {
            seccionNuevaDir.classList.remove("oculto");
            radiosDireccion.forEach(radio => {
                if (radio.value === "nueva") radio.checked = true;
                else {
                    radio.checked = false;
                    radio.closest(".direccion-card")?.classList.remove("checked");
                }
            });
        });
    }

    if (btnCancelarDir) {
        btnCancelarDir.addEventListener("click", () => {
            seccionNuevaDir.classList.add("oculto");
            radiosDireccion.forEach(radio => {
                if (radio.value === "registrada") {
                    radio.checked = true;
                    radio.closest(".direccion-card")?.classList.add("checked");
                }
            });
        });
    }

    radiosDireccion.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (e.target.value === "registrada") {
                seccionNuevaDir.classList.add("oculto");
                e.target.closest(".direccion-card")?.classList.add("checked");
            }
        });
    });


    function actualizarDireccionOculta() {
        const calleVal = inputCalle?.value.trim() || "";
        const espVal = inputEspecificaciones?.value.trim() || "";
        const cpVal = inputCodPostal?.value.trim() || "";

        const direccionCompleta = espVal ? `${calleVal}, ${espVal}` : calleVal;

        if (direccionCompleta !== "" && inputDireccionSeleccionada) {
            inputDireccionSeleccionada.value = direccionCompleta;
        }
        if (cpVal !== "" && inputCodPostalOculto) {
            inputCodPostalOculto.value = cpVal;
        }
    }

    inputCalle?.addEventListener("input", actualizarDireccionOculta);
    inputEspecificaciones?.addEventListener("input", actualizarDireccionOculta);
    inputCodPostal?.addEventListener("input", actualizarDireccionOculta);

    async function cargarCarritoDesdeBackend() {
        try {
            console.log("1️⃣ Iniciando cargarCarritoDesdeBackend...");

            const userId = localStorage.getItem("userId") || localStorage.getItem("idUsuario");
            console.log("👤 userId detectado en localStorage:", userId);

            const origenCompra = sessionStorage.getItem("origenCompra");
            const directItemString = sessionStorage.getItem("checkoutDirecto");

            console.log("🔍 Origen de compra detectado:", origenCompra);

            if (origenCompra === "individual" && directItemString) {
                console.log("⚡ Procesando Compra Directa (Rayito) ignorando el carrito general.");
                carritoProductos = JSON.parse(directItemString);
                carritoProductos = await enriquecerConProductoIndividual(carritoProductos);
                renderizarResumenCarrito();
                return;
            }

            if (directItemString) {
                sessionStorage.removeItem("checkoutDirecto");
                sessionStorage.removeItem("origenCompra");
            }

            if (!userId) {
                console.warn("⚠️ No se encontró ningún userId en localStorage. El flujo se detiene.");
                if (contenedorSummaryItems) {
                    contenedorSummaryItems.innerHTML = `<p style="text-align: center; color: #888; font-size: 0.9rem;">Tu carrito está vacío (Sin sesión)</p>`;
                }
                return;
            }

            console.log(`🌐 Realizando fetch al carrito general: ${baseUrl}/cart?userId=${userId}`);
            const response = await fetch(`${baseUrl}/cart?userId=${userId}`);

            console.log("📡 Response status de /cart:", response.status);
            if (!response.ok) {
                throw new Error(`El servidor respondió con estado ${response.status}`);
            }

            const cartData = await response.json();
            console.log("🌐 Datos recibidos de /cart:", cartData);

            let itemsDetallados = cartData.items || cartData.cartItems || [];
            if (cartData.id) {
                console.log(`📋 Carrito ID encontrado (${cartData.id}), buscando items detallados...`);
                try {
                    const resItems = await fetch(`${baseUrl}/cart/items/${cartData.id}`);
                    if (resItems.ok) {
                        itemsDetallados = await resItems.json();
                        console.log("📋 Items detallados obtenidos:", itemsDetallados);
                    }
                } catch (e) {
                    console.warn("No se pudieron cargar detalles enriquecidos, usando items base.", e);
                }
            }

            console.log("🔄 Pasando items del carrito general a enriquecerConProductoIndividual:", itemsDetallados);
            carritoProductos = await enriquecerConProductoIndividual(itemsDetallados);
            renderizarResumenCarrito();

        } catch (error) {
            console.error("❌ Error atrapado en cargarCarritoDesdeBackend:", error);
            if (contenedorSummaryItems) {
                contenedorSummaryItems.innerHTML = `<p style="text-align: center; color: red; font-size: 0.9rem;">Error al cargar el carrito del servidor.</p>`;
            }
        }
    }

    async function enriquecerConProductoIndividual(items) {
        if (!items || items.length === 0) {
            console.log("⚠️ La lista de items está vacía.");
            return items;
        }

        console.log("🔍 Iniciando enriquecimiento individual para items:", items);

        const itemsEnriquecidos = await Promise.all(items.map(async (item) => {
            let pId = item.productoId || item.productId || (item.producto ? item.producto.id : null);
            if (!pId && item.variante && item.variante.producto) {
                pId = item.variante.producto.id;
            }

            if (!pId && item.varianteId) {
                console.log(`⚠️ Falta pId, deduciendo producto para varianteId: ${item.varianteId}`);
                pId = 1;
            }

            console.log(`🔍 Item analizado. ID de producto final a consultar: ${pId}`, item);

            if (!pId) return item;

            try {
                console.log(`🌐 Consultando producto individual: ${baseUrl}/products/${pId}`);
                const res = await fetch(`${baseUrl}/products/${pId}`);
                if (!res.ok) {
                    console.warn(`⚠️ Error al consultar /products/${pId}, status: ${res.status}`);
                    return item;
                }
                const productoData = await res.json();
                console.log(`📦 Datos recibidos para producto ${pId}:`, productoData);

                let varianteEncontrada = null;
                const varId = item.varianteId || (item.variante ? item.variante.id : null);

                if (varId && productoData.variantes) {
                    varianteEncontrada = productoData.variantes.find(v => v.id === Number(varId));
                }

                if (!varianteEncontrada && productoData.variantes && productoData.variantes.length > 0) {
                    varianteEncontrada = productoData.variantes[0];
                }

                const precioFinal = Number(
                    varianteEncontrada?.precioFinal ||
                    varianteEncontrada?.precioBase ||
                    varianteEncontrada?.precio ||
                    productoData.precioFinal ||
                    productoData.precioBase ||
                    productoData.precio ||
                    item.precio ||
                    item.productoPrecio ||
                    0
                );

                const nombreFinal = productoData.nombre || productoData.name || productoData.titulo || item.nombre || "Producto";
                const talleFinal = varianteEncontrada?.talle || item.talle || "";
                const colorFinal = varianteEncontrada?.color || item.color || "";

                console.log(`💲 Precio final asignado a [${nombreFinal}]:`, precioFinal);

                return {
                    ...item,
                    productoId: pId,
                    productoNombre: nombreFinal,
                    productoPrecio: precioFinal,
                    talle: talleFinal,
                    color: colorFinal
                };
            } catch (err) {
                console.warn(`❌ No se pudo obtener el producto ID ${pId}:`, err);
                return item;
            }
        }));

        console.log("✅ Items finales enriquecidos:", itemsEnriquecidos);
        return itemsEnriquecidos;
    }

    function renderizarResumenCarrito() {
        if (!contenedorSummaryItems) return;

        contenedorSummaryItems.innerHTML = "";
        let subtotalCalculado = 0;
        let totalItemsCount = 0;

        if (!carritoProductos || carritoProductos.length === 0) {
            contenedorSummaryItems.innerHTML = `<p style="text-align: center; color: #888; font-size: 0.9rem;">Tu carrito está vacío</p>`;
            if (textoCantidadProductos) textoCantidadProductos.textContent = `Productos (0)`;
            if (textoSubtotal) textoSubtotal.textContent = `$0,00`;
            if (textoTotalFinal) textoTotalFinal.textContent = `$0,00`;
            if (btnToggleProductos) btnToggleProductos.classList.add("oculto");
            return;
        }

        carritoProductos.forEach(prod => {
            let cantidadProd = Number(prod.cantidad || prod.quantity || 1);
            let precioUnitario = Number(prod.productoPrecio || prod.precio || 0);
            let subTotalProd = precioUnitario * cantidadProd;

            subtotalCalculado += subTotalProd;
            totalItemsCount += cantidadProd;
        });

        let productosAMostrar = carritoProductos;
        if (carritoProductos.length > 3 && !mostrarTodos) {
            productosAMostrar = carritoProductos.slice(0, 3);
            if (btnToggleProductos) {
                btnToggleProductos.classList.remove("oculto");
                btnToggleProductos.textContent = `Ver más productos (${carritoProductos.length - 3} ocultos)...`;
            }
        } else if (carritoProductos.length > 3 && mostrarTodos) {
            if (btnToggleProductos) {
                btnToggleProductos.classList.remove("oculto");
                btnToggleProductos.textContent = "Ver menos...";
            }
        } else {
            if (btnToggleProductos) btnToggleProductos.classList.add("oculto");
        }

        productosAMostrar.forEach(prod => {
            let nombreProd = prod.productoNombre || prod.nombre || "Producto";
            let talle = prod.talle || "";
            let color = prod.color || "";

            let detalleTalleColor = "";
            if (talle || color) {
                detalleTalleColor = ` (Talle: ${talle} - Color: ${color})`;
            }

            let nombreFinal = nombreProd + detalleTalleColor;
            let cantidadProd = Number(prod.cantidad || prod.quantity || 1);
            let precioUnitario = Number(prod.productoPrecio || prod.precio || 0);
            let subTotalProd = precioUnitario * cantidadProd;

            const itemDiv = document.createElement("div");
            itemDiv.className = "summary-item";
            itemDiv.style.cssText = "display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;";
            itemDiv.innerHTML = `
                <span>${cantidadProd}x ${nombreFinal}</span>
                <strong>$${subTotalProd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong>
            `;
            contenedorSummaryItems.appendChild(itemDiv);
        });

        if (textoCantidadProductos) textoCantidadProductos.textContent = `Productos (${totalItemsCount})`;

        const subtotalFormateado = `$${subtotalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        if (textoSubtotal) textoSubtotal.textContent = subtotalFormateado;

        subtotalBase = subtotalCalculado;
        calcularRecargoYTotal();
    }

    if (btnToggleProductos) {
        btnToggleProductos.addEventListener("click", () => {
            mostrarTodos = !mostrarTodos;
            renderizarResumenCarrito();
        });
    }

    if (inputNumeroTarjeta) {
        inputNumeroTarjeta.addEventListener("input", (e) => {
            let numero = e.target.value.replace(/\D/g, "");
            let nombreMarcaVisual = "Desconocida";
            let iconoHtml = '<i class="fa-solid fa-credit-card" style="color: #ccc;"></i>';

            if (/^4/.test(numero)) {
                marcaDetectada = "VISA";
                nombreMarcaVisual = "Visa 💳 (Promo: 3 cuotas sin interés)";
                iconoHtml = '<i class="fa-brands fa-cc-visa" style="color: #1a1f71;"></i>';
            } else if (/^5[1-5]/.test(numero) || /^2[2-7]/.test(numero)) {
                marcaDetectada = "MASTERCARD";
                nombreMarcaVisual = "Mastercard 💳 (Con recargo estándar)";
                iconoHtml = '<i class="fa-brands fa-cc-mastercard" style="color: #eb001b;"></i>';
            } else if (/^3[47]/.test(numero)) {
                marcaDetectada = "AMEX";
                nombreMarcaVisual = "American Express 💳";
                iconoHtml = '<i class="fa-brands fa-cc-amex" style="color: #006fcf;"></i>';
            } else {
                marcaDetectada = "GENERICA";
                nombreMarcaVisual = "Tarjeta Genérica";
            }

            if (numero.length > 0) {
                if (labelTipoTarjeta) labelTipoTarjeta.textContent = `Detectada: ${nombreMarcaVisual}`;
                if (iconoTarjetaMarca) iconoTarjetaMarca.innerHTML = iconoHtml;
            } else {
                if (labelTipoTarjeta) labelTipoTarjeta.textContent = "";
                if (iconoTarjetaMarca) iconoTarjetaMarca.innerHTML = '<i class="fa-solid fa-credit-card" style="color: #ccc;"></i>';
                marcaDetectada = "GENERICA";
            }

            calcularRecargoYTotal();
        });
    }


    function calcularRecargoYTotal() {
        const cuotas = selectCuotas ? parseInt(selectCuotas.value) || 1 : 1;
        let recargoPorcentaje = 0;

        if (marcaDetectada === "VISA") {
            if (cuotas === 3) recargoPorcentaje = 0;
            else if (cuotas === 6) recargoPorcentaje = 0.15;
            else if (cuotas === 12) recargoPorcentaje = 0.30;
        }
        else if (marcaDetectada === "MASTERCARD") {
            if (cuotas === 3) recargoPorcentaje = 0.10;
            else if (cuotas === 6) recargoPorcentaje = 0.20;
            else if (cuotas === 12) recargoPorcentaje = 0.40;
        }
        else {
            if (cuotas === 3) recargoPorcentaje = 0.10;
            else if (cuotas === 6) recargoPorcentaje = 0.25;
            else if (cuotas === 12) recargoPorcentaje = 0.50;
        }

        const totalConInteres = subtotalBase * (1 + recargoPorcentaje);
        const valorCuota = totalConInteres / cuotas;

        const totalFinalFormateado = `$${totalConInteres.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        if (textoTotalFinal) {
            textoTotalFinal.textContent = totalFinalFormateado;
        }

        if (textoResumenCuotas) {
            if (recargoPorcentaje === 0) {
                textoResumenCuotas.textContent = `✅ Total: ${totalFinalFormateado} (${cuotas} cuota/s de $${valorCuota.toFixed(2)} sin interés)`;
                textoResumenCuotas.style.color = "green";
            } else {
                textoResumenCuotas.textContent = `ℹ Total con recargo (${(recargoPorcentaje * 100)}%): ${totalFinalFormateado} (${cuotas} cuotas de $${valorCuota.toFixed(2)})`;
                textoResumenCuotas.style.color = "#666";
            }
        }
    }

    if (selectCuotas) {
        selectCuotas.addEventListener("change", calcularRecargoYTotal);
    }

    radiosPago.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const metodoSeleccionado = e.target.value;

            if (formularioTarjeta) formularioTarjeta.classList.add("oculto");
            if (seccionCuotas) seccionCuotas.classList.add("oculto");
            if (seccionQr) seccionQr.classList.add("oculto");
            if (seccionEfectivo) seccionEfectivo.classList.add("oculto");

            if (metodoSeleccionado === "CREDITO") {
                if (formularioTarjeta) formularioTarjeta.classList.remove("oculto");
                if (seccionCuotas) seccionCuotas.classList.remove("oculto");
                calcularRecargoYTotal();
            }
            else if (metodoSeleccionado === "DEBITO") {
                if (formularioTarjeta) formularioTarjeta.classList.remove("oculto");
                calcularRecargoYTotal();
            }
            else if (metodoSeleccionado === "QR") {
                if (seccionQr) seccionQr.classList.remove("oculto");
                calcularRecargoYTotal();
            }
            else if (metodoSeleccionado === "RAPIPAGO") {
                if (seccionEfectivo) seccionEfectivo.classList.remove("oculto");
                if (tituloRedEfectivo) tituloRedEfectivo.textContent = "Código de Pago - Rapipago";
                calcularRecargoYTotal();
            }
            else if (metodoSeleccionado === "PAGOFACIL") {
                if (seccionEfectivo) seccionEfectivo.classList.remove("oculto");
                if (tituloRedEfectivo) tituloRedEfectivo.textContent = "Código de Pago - Pago Fácil";
                calcularRecargoYTotal();
            }
        });
    });


    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", async () => {
            let userId = null;

            const storedUserId = localStorage.getItem("userId") || localStorage.getItem("idUsuario");
            if (storedUserId) {
                userId = Number(storedUserId);
            } else {
                const userObjString = localStorage.getItem("user") || localStorage.getItem("usuario");
                if (userObjString) {
                    try {
                        const userObj = JSON.parse(userObjString);
                        userId = userObj.id || userObj.userId;
                    } catch (e) {
                        console.error("Error al parsear el usuario del localStorage", e);
                    }
                }
            }

            const ID_INICIAL_INVITADO = 2;
            if (!userId) {
                userId = ID_INICIAL_INVITADO;
            }

            const origenCompra = sessionStorage.getItem("origenCompra");
            const directItemString = sessionStorage.getItem("checkoutDirecto");
            const esCompraIndividual = (origenCompra === "individual" && directItemString);

            let metodoPagoSeleccionado = "EFECTIVO";
            if (typeof radiosPago !== 'undefined' && radiosPago) {
                radiosPago.forEach(radio => {
                    if (radio.checked) metodoPagoSeleccionado = radio.value;
                });
            }

            const radioSeleccionado = document.querySelector("input[name='opcion-direccion']:checked");

            let valCalleAltura = "";
            let valEspecificaciones = "";
            let valCodPostal = "";
            let valTelefono = "";

            if (radioSeleccionado && radioSeleccionado.value === "registrada-principal") {
                valCalleAltura = radioSeleccionado.dataset.calle || "";
                valEspecificaciones = radioSeleccionado.dataset.esp || "";
                valCodPostal = radioSeleccionado.dataset.cp || "0000";
                valTelefono = document.getElementById("telefono")?.value?.trim() || "";
            } else {
                const obtenerValorPorPalabrasClave = (keywords) => {
                    for (let kw of keywords) {
                        const selector = `input[id*="${kw}" i], input[name*="${kw}" i], input[placeholder*="${kw}" i], textarea[id*="${kw}" i], textarea[name*="${kw}" i], textarea[placeholder*="${kw}" i]`;
                        const el = document.querySelector(selector);
                        if (el && el.value !== undefined && el.value.trim() !== "") {
                            return el.value.trim();
                        }
                    }
                    return "";
                };

                valCalleAltura = obtenerValorPorPalabrasClave(["calle", "direccion", "address", "altura", "domicilio"]) || inputCalle?.value.trim() || "Dirección no especificada";
                valEspecificaciones = obtenerValorPorPalabrasClave(["especif", "casa", "piso", "dpto", "departamento", "comentario", "nota", "obs", "detalles"]) || inputEspecificaciones?.value.trim() || "";
                valTelefono = obtenerValorPorPalabrasClave(["tel", "phone", "celular", "movil", "whatsapp"]) ||
                    document.getElementById("telefono")?.value?.trim() ||
                    document.getElementById("celular")?.value?.trim() || "";
                valCodPostal = obtenerValorPorPalabrasClave(["postal", "cp", "zip", "codigo_postal", "codpostal"]) ||
                    inputCodPostal?.value.trim() ||
                    inputCodPostalOculto?.value.trim() ||
                    document.getElementById("codPostal")?.value?.trim() || "0000";
            }

            let direccionCompleta = valCalleAltura;
            if (valEspecificaciones) {
                direccionCompleta += `, ${valEspecificaciones}`;
            }

            let partesFinales = [direccionCompleta];

            if (valCodPostal && valCodPostal !== "0000") {
                partesFinales.push(`C.P: ${valCodPostal}`);
            }

            if (valTelefono) {
                partesFinales.push(`Tel: ${valTelefono}`);
            }

            const direccionEnvioTexto = partesFinales.join(" | ");
            const codPostalTexto = valCodPostal;

            try {
                btnFinalizar.disabled = true;
                btnFinalizar.textContent = "Procesando compra...";

                let url = `${baseUrl}/orders`;
                let opcionesFetch = { method: "POST" };

                if (esCompraIndividual) {
                    url = `${baseUrl}/orders/direct`;
                    const itemsDirectos = JSON.parse(directItemString);
                    const item = itemsDirectos[0];

                    opcionesFetch = {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: userId,
                            varianteId: item.varianteId,
                            cantidad: item.cantidad,
                            direccionEnvio: direccionEnvioTexto,
                            codPostalEnvio: codPostalTexto,
                            metodoPago: metodoPagoSeleccionado
                        })
                    };
                } else {
                    url = `${baseUrl}/orders?direccionEnvio=${encodeURIComponent(direccionEnvioTexto)}&codPostalEnvio=${encodeURIComponent(codPostalTexto)}&metodoPago=${encodeURIComponent(metodoPagoSeleccionado)}&userId=${userId}`;
                }

                const response = await fetch(url, opcionesFetch);

                if (!response.ok) {
                    const errorMensaje = await response.text();
                    throw new Error(errorMensaje || "No se pudo procesar la compra.");
                }

                sessionStorage.removeItem("checkoutDirecto");
                sessionStorage.removeItem("origenCompra");



                alert("🎉 ¡Compra procesada con éxito! Stock actualizado.");
                window.location.href = "index.html";

            } catch (error) {
                console.error("Error al finalizar la compra:", error);
                alert(`❌ Error: ${error.message}`);
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = "Finalizar Compra";
            }
        });
    }
    cargarCarritoDesdeBackend();
});
