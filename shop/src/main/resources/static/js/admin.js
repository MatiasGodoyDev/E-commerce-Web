let todosLosPedidos = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarFormularioProductos();
    cargarPedidos();
    inicializarFormularioUsuarios();
    cargarUsuarios();
    inicializarPrevisualizaciones();
    aplicarPermisosPorRol();
});

function cambiarPestaña(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');
    if (btn) btn.classList.add('active');
}

function inicializarFormularioProductos() {
    const adminForm = document.getElementById('admin-product-form');
    const btnAddVariant = document.getElementById('btn-add-variant');
    const variantesContainer = document.getElementById('variantes-container');

    if (btnAddVariant && variantesContainer) {
        btnAddVariant.addEventListener('click', () => {
            const nuevaFila = document.createElement('div');
            nuevaFila.classList.add('variante-row');
            nuevaFila.innerHTML = `
                <select class="var-talle" required>
                    <option value="" disabled selected>Seleccioná un talle</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                </select>
                
                <input type="text" class="var-color" placeholder="Color (ej: Negro)" required>
                <input type="number" class="var-stock" placeholder="Stock" min="0" required>
                <button type="button" class="btn-remove" onclick="eliminarFilaVariante(this)">✕</button>
            `;
            variantesContainer.appendChild(nuevaFila);
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputDescuento = document.getElementById('descuento');
            const valorDescuento = inputDescuento && inputDescuento.value !== '' ? parseFloat(inputDescuento.value) : 0;

            console.log("Descuento capturado del input:", valorDescuento);

            const productoPayload = {
                nombre: document.getElementById('nombre')?.value || '',
                descripcion: document.getElementById('descripcion')?.value || '',
                precioBase: parseFloat(document.getElementById('precioBase')?.value || 0),
                porcentajeDescuento: valorDescuento,
                categoria: document.getElementById('categoria')?.value || '',
                genero: document.getElementById('genero')?.value || '',
                tipoCorte: document.getElementById('corte')?.value || '',
                materialPrincipal: document.getElementById('material')?.value || '',
                tipoEstampado: document.getElementById('estampado')?.value || '',

                temporada: document.getElementById('temporada')?.value || '',
                etiquetaDestacada: document.getElementById('etiquetaDestacada')?.value || '',
                esNovedad: document.getElementById('esNovedad')?.checked || false,
                esOferta: document.getElementById('esOferta')?.checked || false,
                esModa: document.getElementById('esModa')?.checked || false,
                esUnico: document.getElementById('esUnico')?.checked || false,
                esPersonalizado: document.getElementById('esPersonalizado')?.checked || false,
                variantes: recolectarVariantes()
            };

            const inputFrente = document.getElementById('imagenFrente');
            const inputEspalda = document.getElementById('imagenEspalda');

            const formData = new FormData();
            formData.append('producto', new Blob([JSON.stringify(productoPayload)], { type: 'application/json' }));

            if (inputFrente && inputFrente.files[0]) {
                formData.append('imagenFrente', inputFrente.files[0]);
            }
            if (inputEspalda && inputEspalda.files[0]) {
                formData.append('imagenEspalda', inputEspalda.files[0]);
            }

            try {
                const response = await fetch('http://localhost:8080/api/products', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    let data;
                    try {
                        data = await response.json();
                    } catch {
                        data = { nombre: 'Producto' };
                    }
                    alert(`¡Producto "${data.nombre || 'creado'}" guardado exitosamente!`);
                    adminForm.reset();
                    limpiarPrevisualizaciones();
                } else {
                    const errorMsg = await response.text();
                    console.error('Respuesta error backend:', errorMsg);
                    alert('Error al guardar: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error al conectar con el servidor.');
            }
        });
    }
}

function eliminarFilaVariante(button) {
    const contenedor = document.getElementById('variantes-container');
    if (contenedor && contenedor.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('Debe conservar al menos una variante.');
    }
}

function recolectarVariantes() {
    const variantes = [];
    document.querySelectorAll('.variante-row').forEach(fila => {
        const talle = fila.querySelector('.var-talle')?.value?.trim();
        const color = fila.querySelector('.var-color')?.value?.trim();
        const stockRaw = fila.querySelector('.var-stock')?.value;
        const stock = stockRaw !== '' && stockRaw !== undefined ? parseInt(stockRaw, 10) : 0;

        if (talle && color) {
            variantes.push({ talle, color, stock: isNaN(stock) ? 0 : stock });
        }
    });
    return variantes;
}

function inicializarPrevisualizaciones() {
    document.getElementById('imagenFrente')?.addEventListener('change', (e) => {
        mostrarPreview(e.target, 'previewFrente');
    });

    document.getElementById('imagenEspalda')?.addEventListener('change', (e) => {
        mostrarPreview(e.target, 'previewEspalda');
    });
}

function mostrarPreview(input, idImg) {
    const file = input.files?.[0];
    const preview = document.getElementById(idImg);
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function limpiarPrevisualizaciones() {
    ['previewFrente', 'previewEspalda'].forEach(id => {
        const img = document.getElementById(id);
        if (img) {
            img.src = '';
            img.style.display = 'none';
        }
    });
}

async function cargarPedidos() {
    try {
        const [responseOrders, responseProductos] = await Promise.all([
            fetch('http://localhost:8080/api/orders'),
            fetch('http://localhost:8080/api/products')
        ]);

        if (responseOrders.ok && responseProductos.ok) {
            todosLosPedidos = await responseOrders.json();
            const todosLosProductos = await responseProductos.json();

            todosLosPedidos.forEach(pedido => {
                if (pedido.items) {
                    pedido.items.forEach(item => {
                        const varianteId = item.variante?.id;
                        if (varianteId) {
                            const productoEncontrado = todosLosProductos.find(p =>
                                p.variantes && p.variantes.some(v => v.id === varianteId)
                            );
                            if (productoEncontrado) {
                                item.nombreProductoEnJS = productoEncontrado.nombre;
                                item.etiquetaEnJS = productoEncontrado.etiquetaDestacada || productoEncontrado.etiqueta || '';
                            }
                        }
                    });
                }
            });

            renderizarTablaPedidos(todosLosPedidos);
        }
    } catch (error) {
        console.error('Error al cargar pedidos o productos:', error);
    }
}

function renderizarTablaPedidos(pedidos) {
    const tbody = document.getElementById('pedidos-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No hay pedidos en la base de datos</td></tr>`;
        return;
    }

    pedidos.forEach(pedido => {
        const tr = document.createElement('tr');

        const nombreApellido = `${pedido.user?.nombre || pedido.usuario?.nombre || ''} ${pedido.user?.apellido || pedido.usuario?.apellido || ''}`.trim() || pedido.nombreCliente || 'Cliente';
        const emailCliente = pedido.user?.email || pedido.usuario?.email || pedido.email || 'Sin email';

        const calleAltura = pedido.direccion || pedido.calle || pedido.direccionEnvio || 'No especificada';
        const especificaciones = pedido.especificaciones || pedido.pisoDepto || pedido.detallesDireccion || '';
        const codigoPostal = pedido.codigoPostal ? `(CP: ${pedido.codigoPostal})` : '';

        let totalPrendas = 0;
        let badgesPromosSet = new Set();

        const itemsHtml = pedido.items ? pedido.items.map(i => {
            const nombreProd = i.nombreProductoEnJS || i.variante?.producto?.nombre || i.nombreProducto || 'Prenda';
            const talle = i.variante?.talle || i.talle || 'Única';
            const color = i.variante?.color || i.color || '';
            const cantidadComprada = i.cantidad || 1;

            const textoBusqueda = `${i.etiquetaEnJS || ''} ${i.etiqueta || ''} ${i.tipoPromocion || ''} ${i.variante?.etiqueta || ''} ${i.variante?.producto?.etiqueta || ''} ${i.variante?.producto?.etiquetaDestacada || ''} ${nombreProd}`.toUpperCase();

            const es2x1 = textoBusqueda.includes('2X1');

            let cantidadFisica = cantidadComprada;
            if (es2x1) {
                cantidadFisica = cantidadComprada * 2;
                badgesPromosSet.add(`<span style="background: #ff4d4f; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; display: inline-block;">2X1</span>`);
            }

            totalPrendas += cantidadFisica;

            const detalleVariante = [talle, color].filter(Boolean).join(' - ');

            return `<li>• ${nombreProd} (${detalleVariante}) x${cantidadComprada}</li>`;
        }).join('') : 'Sin datos';

        const htmlPromociones = badgesPromosSet.size > 0 ? Array.from(badgesPromosSet).join(' ') : '<span style="color: #999; font-style: italic;">Sin promo</span>';

        tr.innerHTML = `
            <td>#${pedido.id}</td>
            <td>
                <strong style="font-size: 0.95rem; color: #111; display: block;">${nombreApellido}</strong>
                <span style="font-size: 0.8rem; color: #666;">✉️ ${emailCliente}</span>
            </td>
            <td>
                <ul class="items-list" style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
            </td>
            <td>
                <div style="font-size: 0.85rem; line-height: 1.4;">
                    📍 <strong>${calleAltura}</strong> ${codigoPostal}<br>
                    ${especificaciones ? `<span style="color: #555;">🏠 ${especificaciones}</span>` : '<span style="color: #999; font-style: italic;">Sin especificaciones</span>'}
                </div>
            </td>
            <td>${htmlPromociones}</td>
            <td style="text-align: center; font-weight: bold; color: #333;">${totalPrendas}</td>
            <td>$${pedido.total !== undefined && pedido.total !== null ? Number(pedido.total).toFixed(2) : '0.00'}</td>
            <td><span class="status-badge status-${pedido.estado || 'PENDIENTE'}">${pedido.estado || 'PENDIENTE'}</span></td>
            <td>
                <select onchange="actualizarEstadoPedido(${pedido.id}, this.value)">
                    <option value="PENDIENTE" ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                    <option value="PAGADO" ${pedido.estado === 'PAGADO' ? 'selected' : ''}>Pagado</option>
                    <option value="DESPACHADO" ${pedido.estado === 'DESPACHADO' ? 'selected' : ''}>Despachado</option>
                    <option value="RECIBIDO" ${pedido.estado === 'RECIBIDO' ? 'selected' : ''}>Recibido</option>
                    <option value="CANCELADO" ${pedido.estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:8080/api/orders/${pedidoId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nuevoEstado: nuevoEstado })
        });

        if (response.ok) {
            alert(`Pedido #${pedidoId} modificado a ${nuevoEstado}`);
            cargarPedidos();
        } else {
            const errorMsg = await response.text();
            alert('Error al actualizar el estado del pedido: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
}

function filtrarPedidos(estado, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (estado === 'TODOS') {
        renderizarTablaPedidos(todosLosPedidos);
    } else {
        renderizarTablaPedidos(todosLosPedidos.filter(p => p.estado === estado));
    }
}

function inicializarFormularioUsuarios() {
    const userForm = document.getElementById('form-crear-usuario');
    if (!userForm) return;

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuarioPayload = {
            nombre: document.getElementById('user-nombre')?.value || '',
            apellido: document.getElementById('user-apellido')?.value || '',
            email: document.getElementById('user-email')?.value || '',
            password: document.getElementById('user-password')?.value || '',
            rol: document.getElementById('user-rol')?.value || 'CLIENTE'
        };

        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioPayload)
            });

            if (response.ok) {
                alert('Usuario/Empleado creado correctamente');
                userForm.reset();
                cargarUsuarios();
            } else {
                const errText = await response.text();
                alert('Error al crear el usuario: ' + errText);
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de red al crear usuario.');
        }
    });
}

async function cargarUsuarios() {
    try {
        const response = await fetch('http://localhost:8080/api/admin/users');

        if (!response.ok) {
            const errorTexto = await response.text();
            console.error(`Error del servidor (${response.status}):`, errorTexto);
            return;
        }

        const usuarios = await response.json();
        const personalInterno = usuarios.filter(u => u.rol === 'ADMINISTRADOR' || u.rol === 'EMPLEADO');
        renderizarTablaUsuarios(personalInterno);

    } catch (error) {
        console.error('Error de red al cargar usuarios:', error);
    }
}

function renderizarTablaUsuarios(usuarios) {
    const tbody = document.getElementById('usuarios-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay usuarios cargados</td></tr>`;
        return;
    }

    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${u.id}</td>
            <td><strong>${u.nombre || 'Sin nombre'}</strong></td>
            <td>${u.apellido || 'Sin apellido'}</td>
            <td>${u.email || ''}</td>
            <td>
                <select class="status-badge" onchange="cambiarRolManual(${u.id}, this.value)">
                    <option value="CLIENTE" ${u.rol === 'CLIENTE' ? 'selected' : ''}>CLIENTE</option>
                    <option value="CLIENTEVIP" ${u.rol === 'CLIENTEVIP' ? 'selected' : ''}>CLIENTEVIP</option>
                    <option value="EMPLEADO" ${u.rol === 'EMPLEADO' ? 'selected' : ''}>EMPLEADO</option>
                    <option value="ADMINISTRADOR" ${u.rol === 'ADMINISTRADOR' ? 'selected' : ''}>ADMINISTRADOR</option>
                </select>
            </td>
            <td>
                <button class="btn-remove" onclick="eliminarUsuario(${u.id})">🗑 Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cambiarRolManual(userId, nuevoRol) {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/rol?nuevoRol=${encodeURIComponent(nuevoRol)}`, {
            method: 'PUT'
        });
        if (response.ok) {
            alert(`Rol del usuario #${userId} actualizado a ${nuevoRol}`);
            cargarUsuarios();
        } else {
            alert('No se pudo actualizar el rol (verificar permisos o backend).');
            cargarUsuarios();
        }
    } catch (error) {
        console.error('Error al cambiar rol:', error);
    }
}

async function eliminarUsuario(id) {
    if (confirm(`¿Está seguro de eliminar al usuario #${id}?`)) {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Usuario eliminado');
                cargarUsuarios();
            } else {
                alert('No se pudo eliminar el usuario.');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
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

const TIEMPO_EXPIRACION_MS = 60 * 60 * 1000;    // 1 hora en milisegundos
const TIEMPO_INACTIVIDAD_MS = 60 * 60 * 1000;    // 10 minutos en milisegundos

function registrarActividad() {
    if (localStorage.getItem('adminUser')) {
        localStorage.setItem('adminLastActivity', new Date().getTime().toString());
    }
}

['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evento => {
    window.addEventListener(evento, registrarActividad);
});

setInterval(() => {
    const adminUserStr = localStorage.getItem('adminUser');
    if (!adminUserStr) return;

    const ultimaActividad = localStorage.getItem('adminLastActivity') || localStorage.getItem('adminLoginTime');
    const ahora = new Date().getTime();

    if (ultimaActividad) {
        const tiempoInactivo = ahora - parseInt(ultimaActividad, 10);

        if (tiempoInactivo > TIEMPO_INACTIVIDAD_MS) {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('adminLastActivity');

            alert('Tu sesión ha expirado por inactividad.');
            window.location.reload();
        }
    }
}, 30 * 1000);

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login-admin');
    const containerLogin = document.getElementById('login-admin-container');
    const containerDashboard = document.getElementById('admin-dashboard-container');

    const adminUserStr = localStorage.getItem('adminUser');
    const loginTime = localStorage.getItem('adminLoginTime');

    const ahora = new Date().getTime();
    let sesionValida = false;

    if (adminUserStr && loginTime) {
        const tiempoTranscurrido = ahora - parseInt(loginTime, 10);
        if (tiempoTranscurrido < TIEMPO_EXPIRACION_MS) {
            sesionValida = true;
        } else {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
        }
    }

    if (sesionValida) {
        if (containerLogin) containerLogin.style.display = 'none';
        if (containerDashboard) containerDashboard.style.display = 'block';
        actualizarDatosUsuarioEnPantalla();
        aplicarPermisosPorRol();
    } else {
        if (containerLogin) containerLogin.style.display = 'block';
        if (containerDashboard) containerDashboard.style.display = 'none';
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('http://localhost:8080/api/admin/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();

                    localStorage.setItem('adminUser', JSON.stringify(data));
                    localStorage.setItem('adminLoginTime', new Date().getTime().toString());

                    if (containerLogin) containerLogin.style.display = 'none';
                    if (containerDashboard) containerDashboard.style.display = 'block';

                    actualizarDatosUsuarioEnPantalla();
                    aplicarPermisosPorRol();

                    alert('¡Bienvenido al Panel de Control!');
                } else {
                    alert('Credenciales incorrectas o usuario sin permisos.');
                }
            } catch (error) {
                console.error('Error al intentar iniciar sesión:', error);
                alert('Error al conectar con el servidor para la autenticación.');
            }
        });
    }
});

function actualizarDatosUsuarioEnPantalla() {
    const userJson = localStorage.getItem('adminUser');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();

    const spanNombreHeader = document.getElementById('admin-nombre-apellido');
    if (spanNombreHeader) {
        spanNombreHeader.textContent = nombreCompleto || user.email;
    }

    const inputNombre = document.getElementById('perfil-nombre');
    const inputApellido = document.getElementById('perfil-apellido');
    const inputEmail = document.getElementById('perfil-email');
    const inputTelefono = document.getElementById('perfil-telefono');

    if (inputNombre) inputNombre.value = user.nombre || '';
    if (inputApellido) inputApellido.value = user.apellido || '';
    if (inputEmail) inputEmail.value = user.email || '';
    if (inputTelefono) inputTelefono.value = user.telefono || '';
}

const inputPasswordNueva = document.getElementById('perfil-password-nueva');
const inputPasswordRepetir = document.getElementById('perfil-password-repetir');
const alertaErrorMatch = document.getElementById('error-password-match');

function validarCoincidenciaContrasenas() {
    if (!inputPasswordNueva?.value && !inputPasswordRepetir?.value) {
        if (alertaErrorMatch) alertaErrorMatch.style.display = 'none';
        if (inputPasswordRepetir) inputPasswordRepetir.style.borderColor = '#ccc';
        return true;
    }

    if (inputPasswordNueva?.value !== inputPasswordRepetir?.value) {
        if (alertaErrorMatch) alertaErrorMatch.style.display = 'block';
        if (inputPasswordRepetir) inputPasswordRepetir.style.borderColor = '#e53e3e';
        return false;
    } else {
        if (alertaErrorMatch) alertaErrorMatch.style.display = 'none';
        if (inputPasswordRepetir) inputPasswordRepetir.style.borderColor = '#38a169';
        return true;
    }
}

if (inputPasswordNueva && inputPasswordRepetir) {
    inputPasswordNueva.addEventListener('input', validarCoincidenciaContrasenas);
    inputPasswordRepetir.addEventListener('input', validarCoincidenciaContrasenas);
}

const formPerfil = document.getElementById('form-perfil-admin');
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userJson = localStorage.getItem('adminUser');
        if (!userJson) return;
        const user = JSON.parse(userJson);

        const nombre = document.getElementById('perfil-nombre').value;
        const apellido = document.getElementById('perfil-apellido').value;
        const email = document.getElementById('perfil-email').value;
        const telefono = document.getElementById('perfil-telefono') ? document.getElementById('perfil-telefono').value : '';
        const passwordActual = document.getElementById('perfil-password-actual').value;
        const passwordNueva = inputPasswordNueva ? inputPasswordNueva.value : '';

        if (!validarCoincidenciaContrasenas()) {
            alert('Por favor, corregí las contraseñas antes de guardar.');
            return;
        }

        if (passwordNueva && !passwordActual) {
            alert('Debes ingresar tu contraseña actual para poder establecer una nueva.');
            document.getElementById('perfil-password-actual').focus();
            return;
        }

        const datosActualizados = {
            nombre: nombre,
            apellido: apellido,
            email: email,
            telefono: telefono,
            passwordActual: passwordActual ? passwordActual : null,
            passwordNueva: passwordNueva ? passwordNueva : null
        };

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (response.ok) {
                const usuarioActualizado = await response.json();

                localStorage.setItem('adminUser', JSON.stringify(usuarioActualizado));
                actualizarDatosUsuarioEnPantalla();

                alert('¡Perfil actualizado con éxito!');

                document.getElementById('perfil-password-actual').value = '';
                if (inputPasswordNueva) inputPasswordNueva.value = '';
                if (inputPasswordRepetir) {
                    inputPasswordRepetir.value = '';
                    inputPasswordRepetir.style.borderColor = '#ccc';
                }
            } else {
                const errorMsg = await response.text();
                alert('Error al actualizar el perfil: ' + (errorMsg || 'Verificá tus datos o contraseña actual.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor.');
        }
    });
}

function aplicarPermisosPorRol() {
    const adminUserStr = localStorage.getItem("adminUser");
    const menuUsuarios = document.getElementById("menu-usuarios");
    const seccionUsuarios = document.getElementById("tab-usuarios");

    if (adminUserStr) {
        try {
            const usuario = JSON.parse(adminUserStr);
            if (usuario.rol && usuario.rol.toUpperCase() === "EMPLEADO") {
                if (menuUsuarios) menuUsuarios.style.display = "none";
                if (seccionUsuarios) seccionUsuarios.style.display = "none";
            } else {
                if (menuUsuarios) menuUsuarios.style.display = "inline-block";
                if (seccionUsuarios) seccionUsuarios.style.display = "";
            }
        } catch (e) {
            console.error("Error al parsear adminUser del localStorage", e);
        }
    }
}

function cerrarSesion() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminLastActivity');

    window.location.reload();
}


async function refrescarDatosAdminActuales() {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) return;

    console.log("🔄 Actualizando pedidos y datos del panel automáticamente...");

    if (typeof cargarPedidos === 'function') {
        await cargarPedidos();
    }

    if (typeof cargarUsuarios === 'function') {
        await cargarUsuarios();
    }
}

setInterval(() => {
    if (document.visibilityState === "visible") {
        refrescarDatosAdminActuales();
    }
}, 10 * 1000);

document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
        console.log("👁️ El admin volvió a la pestaña. Forzando actualización inmediata...");
        await refrescarDatosAdminActuales();
    }
});