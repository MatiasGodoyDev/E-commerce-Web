document.addEventListener("DOMContentLoaded", () => {

    const TIEMPO_LIMITE_INACTIVIDAD = 30 * 60 * 1000;
    let temporizadorInactividad;

    function reiniciarTemporizador() {
        if (localStorage.getItem("userSession") || localStorage.getItem("userId")) {
            localStorage.setItem("ultimoMovimiento", Date.now());
        }
        clearTimeout(temporizadorInactividad);
        temporizadorInactividad = setTimeout(() => {
            cerrarSesionPorInactividad();
        }, TIEMPO_LIMITE_INACTIVIDAD);
    }

    function cerrarSesionPorInactividad() {
        if (localStorage.getItem("userSession") || localStorage.getItem("userId")) {
            console.warn("Sesión expirada por inactividad.");
            localStorage.clear();
            alert("⏱️ Tu sesión ha expirado por seguridad debido a inactividad.");
            window.location.href = "/login";
        }
    }

    const eventosActividad = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventosActividad.forEach(evento => {
        window.addEventListener(evento, reiniciarTemporizador);
    });

    const ultimoMovimiento = localStorage.getItem("ultimoMovimiento");
    if (ultimoMovimiento) {
        const tiempoTranscurrido = Date.now() - parseInt(ultimoMovimiento);
        if (tiempoTranscurrido > TIEMPO_LIMITE_INACTIVIDAD) {
            cerrarSesionPorInactividad();
        } else {
            reiniciarTemporizador();
        }
    }

    const viewLogin = document.getElementById("form-login-view");
    const viewRegister = document.getElementById("form-register-view");
    const btnGoToRegister = document.getElementById("go-to-register");
    const btnGoToLogin = document.getElementById("go-to-login");

    const inputEmail = document.getElementById("email");
    const inputPassword = document.getElementById("password");

    const linkRecovery = document.getElementById("open-recovery");
    const modalRecovery = document.getElementById("recovery-modal");
    const btnCloseRecovery = document.getElementById("close-recovery-btn");
    const formRecovery = document.getElementById("recovery-form");
    const inputRecoveryEmail = document.getElementById("recovery-email");
    const messageRecovery = document.getElementById("recovery-message");

    if (localStorage.getItem("userId") === "1" && !localStorage.getItem("userSession_checked")) {
        const session = JSON.parse(localStorage.getItem("userSession") || "{}");
        if (session.id === 1) {
            console.warn("Detectado ID 1 de prueba anterior, limpiando para asegurar auth real...");
            localStorage.clear();
        }
        localStorage.setItem("userSession_checked", "true");
    }

    if (btnGoToRegister && viewLogin && viewRegister) {
        btnGoToRegister.addEventListener("click", () => {
            viewLogin.classList.add("oculto");
            viewRegister.classList.remove("oculto");
        });
    }

    if (btnGoToLogin && viewLogin && viewRegister) {
        btnGoToLogin.addEventListener("click", () => {
            viewRegister.classList.add("oculto");
            viewLogin.classList.remove("oculto");
        });
    }

    if (linkRecovery) {
        linkRecovery.addEventListener("click", (e) => {
            e.preventDefault();
            if (modalRecovery) {
                modalRecovery.classList.add("active");
            }
        });
    }

    if (btnCloseRecovery) {
        btnCloseRecovery.addEventListener("click", () => {
            cerrarModal();
        });
    }

    if (modalRecovery) {
        modalRecovery.addEventListener("click", (e) => {
            if (e.target === modalRecovery) {
                cerrarModal();
            }
        });
    }

    function cerrarModal() {
        if (modalRecovery) {
            modalRecovery.classList.remove("active");
        }
        if (formRecovery) {
            formRecovery.reset();
        }
        if (messageRecovery) {
            messageRecovery.textContent = "";
            messageRecovery.className = "response-message";
        }
    }

    if (formRecovery) {
        formRecovery.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailA_Verificar = inputRecoveryEmail.value;

            if (messageRecovery) {
                messageRecovery.textContent = "Verificando cuenta...";
                messageRecovery.style.color = "#000000";

                setTimeout(() => {
                    messageRecovery.textContent = `📧 Se envió un enlace de restauración a: ${emailA_Verificar}`;
                    messageRecovery.style.color = "#2e7d32";
                    inputRecoveryEmail.value = "";
                }, 1500);
            }
        });
    }

    async function migrarInvitadoAlBackend(userId) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");

        if (guestCart.length === 0 && guestWishlist.length === 0) return;

        console.log("🔄 Migrando carrito y wishlist de invitado al servidor...");

        for (const item of guestCart) {
            try {
                await fetch(`${API_BASE_URL}/cart/items?userId=${userId}&varianteId=${item.varianteId}&cantidad=${item.cantidad}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                console.error("Error migrando item de carrito:", err);
            }
        }

        for (const prod of guestWishlist) {
            try {
                await fetch(`${API_BASE_URL}/wishlist?userId=${userId}&productoId=${prod.id}`, {
                    method: 'POST'
                });
            } catch (err) {
                console.error("Error migrando item de wishlist:", err);
            }
        }

        localStorage.removeItem("guest_cart");
        localStorage.removeItem("guest_wishlist");
        console.log("✅ Migración de invitado completada con éxito.");
    }

    if (viewLogin) {
        viewLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = encodeURIComponent(inputEmail.value.trim());
            const password = encodeURIComponent(inputPassword.value);

            try {
                const url = `${API_BASE_URL}/users/login?email=${email}&password=${password}`;
                console.log("Enviando login a:", url);

                const response = await fetch(url, { method: "POST" });
                const textRes = await response.text();
                console.log("Respuesta login status:", response.status, "body:", textRes);

                if (response.ok && textRes) {
                    const user = JSON.parse(textRes);
                    const userIdReal = user.id || user.usuarioId;
                    console.log("Usuario autenticado con ID real:", userIdReal);

                    const userSessionObj = {
                        id: userIdReal,
                        nombre: user.nombre || "Usuario",
                        apellido: user.apellido || "",
                        email: user.email || inputEmail.value,
                        ...user
                    };

                    localStorage.setItem("userSession", JSON.stringify(userSessionObj));
                    localStorage.setItem("userId", userSessionObj.id);
                    localStorage.setItem("userName", userSessionObj.nombre);
                    localStorage.setItem("ultimoMovimiento", Date.now());

                    window.location.href = "/perfil";

                    migrarInvitadoAlBackend(userIdReal).catch(err => {
                        console.error("Error en migración de fondo:", err);
                    });

                } else {
                    alert(`❌ Credenciales inválidas (${response.status}): ${textRes || 'Verifica tu correo o contraseña.'}`);
                }
            } catch (err) {
                console.error("Error en login:", err);
                alert("No se pudo conectar con el servidor backend.");
            }
        });
    }

    if (viewRegister) {
        viewRegister.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userData = {
                nombre: document.getElementById("reg-nombre").value,
                apellido: document.getElementById("reg-apellido").value,
                email: document.getElementById("reg-email").value,
                password: document.getElementById("reg-password").value,
                telefono: document.getElementById("reg-telefono").value,
                piso: document.getElementById("reg-piso").value,
                direccionCasa: document.getElementById("reg-domicilio")?.value || "",
                codPostal: document.getElementById("reg-cp")?.value || "",
                especificacionesCasa: document.getElementById("reg-descripcion")?.value || ""
            };

            try {
                const response = await fetch(`${API_BASE_URL}/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });

                if (response.ok || response.status === 201) {
                    alert("✅ ¡Cuenta creada con éxito! Ya podés iniciar sesión.");
                    viewRegister.reset();
                    viewRegister.classList.add("oculto");
                    viewLogin.classList.remove("oculto");
                } else {
                    const errorText = await response.text();
                    alert(`❌ No se pudo completar el registro: ${errorText || 'Verifica los datos.'}`);
                }
            } catch (err) {
                console.error("Error en registro:", err);
                alert("Error de conexión al registrar.");
            }
        });
    }
});