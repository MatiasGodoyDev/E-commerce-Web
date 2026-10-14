let imagenCargada = null;

document.addEventListener('DOMContentLoaded', () => {
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
      badge.classList.add('badge-descuento', `badge-${tipoPromo.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
      badge.textContent = tipoPromo.toUpperCase();
      if (cajaImagen) cajaImagen.appendChild(badge);
    } else if (porcentajeDescuento > 0 && precioBase > 0) {
      const montoDescuento = (precioBase * porcentajeDescuento) / 100;
      const precioFinal = precioBase - montoDescuento;

      elPrecioOriginal.textContent = formatoMoneda.format(precioBase);
      if (elPrecioDescuento) elPrecioDescuento.textContent = formatoMoneda.format(precioFinal);
      elPrecioOriginal.classList.add('has-discount');

      const badge = document.createElement('span');
      badge.classList.add('badge-descuento');
      badge.innerHTML = `${porcentajeDescuento}%<small>OFF</small>`;
      if (cajaImagen) cajaImagen.appendChild(badge);
    } else {
      elPrecioOriginal.textContent = formatoMoneda.format(precioBase);
      if (elPrecioDescuento) elPrecioDescuento.textContent = '';
    }
  });

  const pasoSeleccion = document.getElementById("paso-seleccion");
  const pasoPersonalizador = document.getElementById("paso-personalizador");
  const botonesPrenda = document.querySelectorAll(".card-opcion");
  const btnVolver = document.getElementById("btn-volver");
  const tituloPrendaActual = document.getElementById("titulo-prenda-actual");

  botonesPrenda.forEach((boton) => {
    boton.addEventListener("click", () => {
      const prendaSeleccionada = boton.dataset.prenda || "remera";
      const modeloEspecifico = boton.dataset.modelo;

      if (pasoSeleccion) pasoSeleccion.style.display = "none";
      if (pasoPersonalizador) pasoPersonalizador.style.display = "block";
      if (tituloPrendaActual) tituloPrendaActual.textContent = `Editando: ${prendaSeleccionada.toUpperCase()}`;

      cargarModelo3D(prendaSeleccionada, modeloEspecifico);
    });
  });

  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      if (pasoPersonalizador) pasoPersonalizador.style.display = "none";
      if (pasoSeleccion) pasoSeleccion.style.display = "block";
    });
  }

  const visor3D = document.getElementById("visor-remera");
  const radiosGenero = document.querySelectorAll('input[name="genero"]');

  radiosGenero.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (!visor3D) return;

      const titulo = document.getElementById("titulo-prenda-actual")?.textContent.toLowerCase() || "";

      if (titulo.includes("buzo")) {
        visor3D.src = "/objets/hoodie.glb";
      } else if (titulo.includes("chomba")) {
        visor3D.src = "/objets/polo_shirt.glb";
      } else {
        visor3D.src = e.target.value;
      }
    });
  });

  if (visor3D) {
    visor3D.addEventListener("load", () => {
      aplicarColorPrenda();
    });
  }

  const radiosColorPrenda = document.querySelectorAll('input[name="color-prenda"]');
  radiosColorPrenda.forEach((radio) => {
    radio.addEventListener("change", () => {
      aplicarColorPrenda();
    });
  });

  const radiosColorTexto = document.querySelectorAll('input[name="color-texto"]');
  radiosColorTexto.forEach((radio) => {
    radio.addEventListener("change", () => {
      dibujarTextura();
    });
  });

  const selectMaterial = document.getElementById("select-material");
  if (selectMaterial) {
    selectMaterial.addEventListener("change", (e) => {
      console.log("Material elegido:", e.target.value);
      calcularTotal();
    });
  }

  const radiosTalle = document.querySelectorAll('input[name="talle"]');
  radiosTalle.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      console.log("Talle seleccionado:", e.target.value);
      calcularTotal();
    });
  });

  const comboPersonalizacion = document.getElementById("tipo-personalizacion");
  if (comboPersonalizacion) {
    comboPersonalizacion.addEventListener("change", cambiarOpcion);
  }

  const campoTexto = document.getElementById("campo-texto");
  if (campoTexto) {
    campoTexto.addEventListener("input", dibujarTextura);
  }

  const campoArchivo = document.getElementById("campo-archivo");
  if (campoArchivo) {
    campoArchivo.addEventListener("change", cargarImagen);
  }

  ["posX", "posY", "escala"].forEach((id) => {
    const slider = document.getElementById(id);
    if (slider) slider.addEventListener("input", dibujarTextura);
  });
});

function cargarModelo3D(tipoPrenda, rutaRuta) {
  const visor3D = document.getElementById("visor-remera");
  if (!visor3D) return;

  if (rutaRuta) {
    visor3D.src = rutaRuta;
    return;
  }

  const modelos = {
    remera: "/objets/t_shirt.glb",
    buzo: "/objets/hoodie.glb",
    chomba: "/objets/polo_shirt.glb"
  };

  const clave = tipoPrenda.toLowerCase();
  if (modelos[clave]) {
    visor3D.src = modelos[clave];
  }
}

function aplicarColorPrenda() {
  const visor3D = document.getElementById("visor-remera");
  const radioColor = document.querySelector('input[name="color-prenda"]:checked');

  if (!radioColor || !visor3D || !visor3D.model || !visor3D.model.materials) return;

  const colorHex = radioColor.value;
  const colorRgb = hexToRgba(colorHex);

  visor3D.model.materials.forEach((material) => {
    if (material.pbrMetallicRoughness) {
      material.pbrMetallicRoughness.setBaseColorFactor(colorRgb);
    }
  });

  if (typeof visor3D.requestUpdate === 'function') {
    visor3D.requestUpdate();
  }
}

function hexToRgba(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(char => char + char).join('');
  const num = parseInt(c, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
    1.0
  ];
}


function cargarImagen(event) {
  const archivo = event.target ? event.target.files[0] : event.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = (e) => {
    imagenCargada = new Image();
    imagenCargada.onload = () => {
      dibujarTextura();
    };
    imagenCargada.src = e.target.result;
  };
  lector.readAsDataURL(archivo);
}

function cambiarOpcion() {
  const combo = document.getElementById("tipo-personalizacion");
  if (!combo) return;

  const opcion = combo.options[combo.selectedIndex].value;
  const bloqueTexto = document.getElementById("bloque-texto");
  const bloqueArchivo = document.getElementById("bloque-archivo");
  const panelPosicion = document.getElementById("panel-posicion");
  const bloqueColorTexto = document.getElementById("bloque-color-texto");

  if (bloqueTexto) bloqueTexto.style.display = "none";
  if (bloqueArchivo) bloqueArchivo.style.display = "none";
  if (panelPosicion) panelPosicion.style.display = "none";
  if (bloqueColorTexto) bloqueColorTexto.style.display = "none";

  if (opcion === "texto") {
    if (bloqueTexto) bloqueTexto.style.display = "block";
    if (panelPosicion) panelPosicion.style.display = "block";
    if (bloqueColorTexto) bloqueColorTexto.style.display = "block";
  } else if (opcion === "archivo") {
    if (bloqueArchivo) bloqueArchivo.style.display = "block";
    if (panelPosicion) panelPosicion.style.display = "block";
  }

  dibujarTextura();
  calcularTotal();
}

function dibujarTextura() {
  const combo = document.getElementById("tipo-personalizacion");
  const opcion = combo ? combo.value : "ninguna";
  const campoTexto = document.getElementById("campo-texto");
  const textoVal = campoTexto ? campoTexto.value : "";

  const radioColorTexto = document.querySelector('input[name="color-texto"]:checked');
  const colorTextoHex = radioColorTexto ? radioColorTexto.value : "#ffffff";

  const estampaTexto = document.getElementById("estampa-texto");
  const estampaImagen = document.getElementById("estampa-imagen");
  const estampaContenido = document.getElementById("estampa-contenido");

  const inputX = document.getElementById("posX");
  const inputY = document.getElementById("posY");
  const inputEscala = document.getElementById("escala");

  const posX = parseInt(inputX ? inputX.value : 0);
  const posY = parseInt(inputY ? inputY.value : 0);
  const escala = parseInt(inputEscala ? inputEscala.value : 20) / 20;

  if (estampaContenido) {
    estampaContenido.style.transform = `translate(${posX}px, ${posY}px) scale(${escala})`;
  }

  if (opcion === "texto" && textoVal.trim() !== "") {
    if (estampaTexto) {
      estampaTexto.textContent = textoVal;
      estampaTexto.style.color = colorTextoHex;
      estampaTexto.style.display = "block";
    }
    if (estampaImagen) estampaImagen.style.display = "none";
  } else if (opcion === "archivo" && imagenCargada) {
    if (estampaImagen) {
      estampaImagen.src = imagenCargada.src;
      estampaImagen.style.display = "block";
    }
    if (estampaTexto) estampaTexto.style.display = "none";
  } else {
    if (estampaTexto) estampaTexto.style.display = "none";
    if (estampaImagen) estampaImagen.style.display = "none";
  }
}

function actualizarPrecioPantalla(monto) {
  const elementoPrecio = document.getElementById("precio-total");
  if (elementoPrecio) {
    elementoPrecio.innerText = `$${monto.toLocaleString("es-AR")}`;
  }
}

function calcularTotal() {
  let precioBase = Proximamente;
  let recargos = 0;

  const combo = document.getElementById("tipo-personalizacion");
  if (combo && combo.value !== "ninguna") {
    recargos += 2000;
  }

  let totalFinal = precioBase + recargos;
  actualizarPrecioPantalla(totalFinal);
}

async function capturarPedidoParaAdmin() {
  const visor3D = document.getElementById("visor-remera");
  const combo = document.getElementById("tipo-personalizacion");
  const opcion = combo ? combo.value : "ninguna";

  let captura3D = "";
  if (visor3D && typeof visor3D.toDataURL === "function") {
    captura3D = await visor3D.toDataURL("image/png");
  }

  const datosOrden = {
    fecha: new Date().toLocaleString("es-AR"),
    prenda: document.getElementById("titulo-prenda-actual")?.textContent.replace("Editando: ", "") || "REMERA",
    genero: document.querySelector('input[name="genero"]:checked')?.value || "Hombre",
    talle: document.querySelector('input[name="talle"]:checked')?.value || "M",
    material: document.getElementById("select-material")?.value || "Algodón 100%",
    colorPrendaHex: document.querySelector('input[name="color-prenda"]:checked')?.value || "#000000",
    personalizacion: {
      tipo: opcion,
      texto: opcion === "texto" ? document.getElementById("campo-texto")?.value : null,
      colorTextoHex: opcion === "texto" ? (document.querySelector('input[name="color-texto"]:checked')?.value || "#ffffff") : null,
      imagenAdjunta: opcion === "archivo" && imagenCargada ? imagenCargada.src : null,
      coordenadas: {
        posX: document.getElementById("posX")?.value || 0,
        posY: document.getElementById("posY")?.value || 0,
        escala: document.getElementById("escala")?.value || 20
      }
    },
    vistaPreviaRender: captura3D
  };

  console.log("=== ORDEN COMPLETA PARA EL ADMIN ===", datosOrden);
  return datosOrden;
}

window.cambiarOpcion = cambiarOpcion;
window.cargarImagen = cargarImagen;
window.dibujarTextura = dibujarTextura;
window.capturarPedidoParaAdmin = capturarPedidoParaAdmin;