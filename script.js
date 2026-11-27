// 1. Configuración de conexión y WhatsApp
const URL_API = "https://script.google.com/macros/s/AKfycbxQ5XnJ81qF-GYzdHcl6GYG8FNX1Wj4l3fGw7b9Ymu8IAtRwnx7z56Dsw8-d_4lV7RsRg/exec";
const NUMERO_WHATSAPP = "84267372";
const TELEFONO_WA_COMPLETO = `506${NUMERO_WHATSAPP}`;

// 2. Hero Editorial Rotativo (pausa al pasar el cursor)
(function () {
  const heroSlider = document.getElementById("heroSlider");
  if (!heroSlider) return;

  const slides = heroSlider.querySelectorAll(".hero-slide");
  const dots = heroSlider.querySelectorAll(".hero-dot");
  if (!slides.length) return;

  let indiceActual = 0;
  let intervaloHero = null;

  function mostrarSlide(nuevoIndice) {
    slides.forEach((slide, i) => {
      const esActiva = i === nuevoIndice;
      slide.classList.toggle("activa", esActiva);
      slide.setAttribute("aria-hidden", String(!esActiva));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("activa", i === nuevoIndice);
    });
    indiceActual = nuevoIndice;
  }

  function iniciarRotacion() {
    detenerRotacion();
    intervaloHero = setInterval(() => {
      const siguiente = (indiceActual + 1) % slides.length;
      mostrarSlide(siguiente);
    }, 8000);
  }

  function detenerRotacion() {
    if (intervaloHero) {
      clearInterval(intervaloHero);
      intervaloHero = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.slide);
      if (!Number.isNaN(idx)) {
        mostrarSlide(idx);
        iniciarRotacion();
      }
    });
  });

  heroSlider.addEventListener("mouseenter", detenerRotacion);
  heroSlider.addEventListener("mouseleave", iniciarRotacion);

  iniciarRotacion();
})();

// 3. Función para llevar un producto elegido al formulario de pedidos
function seleccionarProducto(nombreProducto, precioBase, porcionesSugeridas) {
  const selectProducto = document.getElementById("producto");
  const inputMonto = document.getElementById("monto_estimado");
  const inputDetalles = document.getElementById("detalles");

  if (!selectProducto) {
    const params = new URLSearchParams();
    if (nombreProducto) params.set("producto", nombreProducto);
    if (precioBase) params.set("precio", precioBase);
    if (porcionesSugeridas) params.set("porciones", porcionesSugeridas);
    window.location.href = `pedidos.html?${params.toString()}`;
    return;
  }

  // Detectar si viene con un detalle entre paréntesis, ej: "Queque Personalizado (Boda)"
  let productoBase = nombreProducto || "";
  let detalleEstilo = "";
  const matchEstilo = productoBase.match(/^(.+?)\s*\((.+)\)$/);

  if (matchEstilo) {
    productoBase = matchEstilo[1].trim();
    detalleEstilo = matchEstilo[2].trim();
  }

  const opcionesDisponibles = Array.from(selectProducto.options).map((opt) => opt.value);
  let valorFinalSelect = nombreProducto;

  if (opcionesDisponibles.includes(nombreProducto)) {
    valorFinalSelect = nombreProducto;
  } else if (opcionesDisponibles.includes(productoBase)) {
    valorFinalSelect = productoBase;
} else if (nombreProducto) {
    const nuevaOpcion = new Option(nombreProducto, nombreProducto);
    if (porcionesSugeridas) nuevaOpcion.setAttribute("data-porciones", porcionesSugeridas);
    if (precioBase) nuevaOpcion.setAttribute("data-precio", precioBase);
    selectProducto.add(nuevaOpcion);
    valorFinalSelect = nombreProducto;
  }

  if (valorFinalSelect) {
    selectProducto.value = valorFinalSelect;
  }

  selectProducto.dispatchEvent(new Event("change"));

  if (inputMonto) {
    inputMonto.value = precioBase || "Por definir";
  }

  if (detalleEstilo && inputDetalles && !inputDetalles.value.trim()) {
    inputDetalles.value = `Estilo / ocasión: ${detalleEstilo}. Relleno deseado: `;
  }

  actualizarResumenProducto(
    nombreProducto,
    porcionesSugeridas || (detalleEstilo ? `Estilo: ${detalleEstilo}` : ""),
    precioBase || ""
  );

  const seccionPedidos = document.getElementById("pedidos") || document.getElementById("formularioPedido");
  if (seccionPedidos) {
    seccionPedidos.scrollIntoView({ behavior: "smooth" });
  }
}

// 4. Auto-ajustar porciones, monto y mostrar opciones de color/decoración si es Queque
const selectProductoEl = document.getElementById("producto");
const opcionesQuequeEl = document.getElementById("opciones-queque");
const panelPersonalizadoEl = document.getElementById("panel-personalizado");
const radiosDecoracion = document.querySelectorAll('input[name="tipo_decoracion"]');
const botonesColor = document.querySelectorAll(".color-btn");
const inputColorSeleccionado = document.getElementById("color_seleccionado");
const inputColorOtro = document.getElementById("color_otro");
const textoColorElegido = document.getElementById("color-elegido-texto");
const inputFechaEl = document.getElementById("fecha");
const avisoFechaEl = document.getElementById("aviso-fecha");
const IMAGENES_PEDIDO = {
  "Queque Mini": "img/catalogo/qmin.webp",
  "Queque Pequeño": "img/catalogo/qpeq.webp",
  "Queque Mediano": "img/catalogo/qmed.webp",
  "Queque Grande": "img/catalogo/qgrd.webp",
  "Queque Especiales": "img/catalogo/especiales.webp",
  "Queque Personalizado": "img/personalizados/personalizados.webp"
};

let tecnicaPersonalizadaActiva = "";

function detectarTecnicaDesdeTexto(texto = "") {
  const t = String(texto).toLowerCase();
  if (t.includes("hoja de arroz") || t.includes("lámina") || t.includes("lamina")) {
    return "Hoja de arroz";
  }
  if (t.includes("topper")) return "Toppers";
  if (t.includes("flor")) return "Flores";
  if (t.includes("lambeth")) return "Estilo Lambeth";
  if (t.includes("mano alzada") || t.includes("dibujo")) return "Dibujo a mano alzada";
  return "";
}

function sincronizarOpcionesTecnica(tecnica) {
  if (!tecnica) return;

  const radioPersonalizado = document.querySelector('input[name="tipo_decoracion"][value="Personalizado"]');
  if (radioPersonalizado && !radioPersonalizado.checked) {
    radioPersonalizado.checked = true;
    radioPersonalizado.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const checkboxes = document.querySelectorAll('#panel-personalizado input[type="checkbox"], input[type="checkbox"][name*="decoracion"], input[type="checkbox"][name*="tecnica"]');
  checkboxes.forEach((chk) => {
    const etiqueta = (chk.value || chk.parentElement?.textContent || "").trim().toLowerCase();
    if (etiqueta.includes(tecnica.toLowerCase())) {
      chk.checked = true;
      chk.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  const requiereImagenWa = ["Hoja de arroz", "Toppers", "Dibujo a mano alzada"].includes(tecnica);
  if (requiereImagenWa) {
    const selectWa = document.querySelector('select[name*="whatsapp"], select[id*="whatsapp"], select[id*="referencia"]');
    if (selectWa) {
      const opcionSi = Array.from(selectWa.options).find((opt) =>
        /^(s[íi]|yes)/i.test(opt.value.trim()) || /^(s[íi]|yes)/i.test(opt.textContent.trim())
      );
      if (opcionSi) {
        selectWa.value = opcionSi.value;
        selectWa.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }
}

function actualizarResumenProducto(nombreValor, porcionesTexto, precioTexto = "") {
  const nombreEl = document.getElementById("resumen-producto-nombre");
  const metaEl = document.getElementById("resumen-producto-meta");
  const imgEl = document.getElementById("resumen-producto-img");
  const selectProducto = document.getElementById("producto");
  if (!nombreEl || !metaEl || !imgEl) return;

  if (!nombreValor) {
    nombreEl.textContent = "Aún no has elegido un queque";
    metaEl.textContent = "Selecciona una opción de la lista o cambia de producto cuando gustes.";
    imgEl.src = "img/default.webp";
    imgEl.alt = "Vista previa del queque seleccionado";
    return;
  }

  const nombreLower = nombreValor.toLowerCase();
  const esPersonalizado = Boolean(
    selectProducto && selectProducto.value.toLowerCase().includes("personalizado")
  );

  // Mantiene "Queque Personalizado" en el título cuando la calculadora devuelve un tamaño base
  const tituloMostrar =
    esPersonalizado && !nombreLower.includes("personalizado")
      ? `Queque Personalizado · ${nombreValor}`
      : nombreValor;

  nombreEl.textContent = tituloMostrar;

  const partesMeta = [];
  if (porcionesTexto && porcionesTexto !== "Por definir") {
    partesMeta.push(`Porciones / referencia: ${porcionesTexto}`);
  }

  const precioLimpio = String(precioTexto || "").trim();
  if (precioLimpio && precioLimpio.toLowerCase() !== "por definir") {
    const precioMostrar = /^\d+(\.\d+)?$/.test(precioLimpio)
      ? `₡${Number(precioLimpio).toLocaleString("es-CR")}`
      : precioLimpio;
    partesMeta.push(esPersonalizado ? `Base: ${precioMostrar} (a cotizar)` : `Precio: ${precioMostrar}`);
  }

  metaEl.textContent = partesMeta.length
    ? partesMeta.join(" · ")
    : "Listo para completar relleno, fecha y detalles.";

  if (nombreLower.includes("piso")) {
    imgEl.src = "img/personalizados/dospisos.webp";

    const radioPersonalizado = document.querySelector('input[name="tipo_decoracion"][value="Personalizado"]');
    if (radioPersonalizado && !radioPersonalizado.checked) {
      radioPersonalizado.checked = true;
      radioPersonalizado.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else if (esPersonalizado) {
    imgEl.src = IMAGENES_PEDIDO["Queque Personalizado"] || "img/personalizados/personalizados.webp";
  } else {
    const claveCoincidente = Object.keys(IMAGENES_PEDIDO).find((clave) =>
      nombreLower.includes(clave.toLowerCase())
    );
    imgEl.src = claveCoincidente ? IMAGENES_PEDIDO[claveCoincidente] : "img/catalogo/grandes.webp";
  }

  imgEl.alt = `Imagen de ${tituloMostrar}`;

  const tecnicaDetectada = detectarTecnicaDesdeTexto(nombreValor);
  if (tecnicaDetectada) {
    tecnicaPersonalizadaActiva = tecnicaDetectada;
  }
  if (tecnicaPersonalizadaActiva) {
    sincronizarOpcionesTecnica(tecnicaPersonalizadaActiva);
  }
}

const PRODUCTOS_48H = [
  "Queque Personalizado",
  "Queque Grande",
  "Queque 20",
  "Queque 24",
  "Queque 28",
  "Queque 32"
];

function formatearFechaLocal(fecha) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

function requiere48Horas() {
  if (!selectProductoEl) return false;
  const prod = selectProductoEl.value || "";
  const prodMin = prod.toLowerCase();
  const esQueque = prodMin.includes("queque");
  const deco = document.querySelector('input[name="tipo_decoracion"]:checked')?.value;
  const esTamano48h =
    PRODUCTOS_48H.includes(prod) ||
    prodMin.includes("pisos") ||
    prodMin.includes("mayor a 20");
  return esTamano48h || (esQueque && deco === "Personalizado");
}

function actualizarMinimoFecha() {
  if (!inputFechaEl) return;

  const ahora = new Date();
  const exige48h = requiere48Horas();
  const fechaMinima = exige48h
    ? new Date(ahora.getTime() + 48 * 60 * 60 * 1000)
    : ahora;

  const minFormateado = formatearFechaLocal(fechaMinima);
  inputFechaEl.min = minFormateado;

  if (avisoFechaEl) {
    avisoFechaEl.classList.toggle("oculto", !exige48h);
  }

  if (inputFechaEl.value && inputFechaEl.value < minFormateado) {
    inputFechaEl.value = "";
  }
}

function actualizarPanelPersonalizado() {
  if (!panelPersonalizadoEl) return;
  const seleccionado = document.querySelector('input[name="tipo_decoracion"]:checked');
  const esPersonalizado = Boolean(seleccionado && seleccionado.value === "Personalizado");
  const notaTradicionalEl = document.getElementById("relleno-tradicional-nota");

  if (esPersonalizado) {
    panelPersonalizadoEl.classList.remove("oculto");
    if (notaTradicionalEl) notaTradicionalEl.classList.add("oculto");
  } else {
    panelPersonalizadoEl.classList.add("oculto");
    if (notaTradicionalEl) notaTradicionalEl.classList.remove("oculto");
    const rellenoEl = document.getElementById("relleno");
    if (rellenoEl) rellenoEl.value = "Leche condensada";
  }
  actualizarMinimoFecha();
}

if (radiosDecoracion.length) {
  radiosDecoracion.forEach((radio) => {
    radio.addEventListener("change", actualizarPanelPersonalizado);
  });
}

if (botonesColor.length) {
  botonesColor.forEach((btn) => {
    btn.addEventListener("click", () => {
      botonesColor.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      const color = btn.dataset.color;
      if (inputColorSeleccionado) {
        inputColorSeleccionado.value = color;
      }

      if (textoColorElegido) {
        textoColorElegido.innerHTML =
          color === "Otro"
            ? 'Color seleccionado: <strong>Personalizado (escríbelo abajo)</strong>'
            : `Color seleccionado: <strong>${color}</strong>`;
      }

      if (inputColorOtro) {
        if (color === "Otro") {
          inputColorOtro.classList.remove("oculto");
          inputColorOtro.focus();
        } else {
          inputColorOtro.classList.add("oculto");
          inputColorOtro.value = "";
        }
      }
    });
  });
}

if (selectProductoEl) {
  selectProductoEl.addEventListener("change", function () {
    const opcionSeleccionada = this.options[this.selectedIndex];
    if (!opcionSeleccionada) return;

    const precioBase = opcionSeleccionada.getAttribute("data-precio");
    const inputMonto = document.getElementById("monto_estimado");

    if (inputMonto) {
    inputMonto.value = precioBase || "Por definir";
  }

 actualizarResumenProducto(
    this.value,
    opcionSeleccionada.getAttribute("data-porciones") || "",
    precioBase || ""
  );

  if (!(this.value || "").toLowerCase().includes("personalizado")) {
  tecnicaPersonalizadaActiva = "";
}

  const panelPorcionesPedido = document.getElementById("panel-porciones-pedido");
if (panelPorcionesPedido) {
  const valorLower = (this.value || "").toLowerCase();
  const mostrarCalculadora =
    this.value === "Queque mayor a 20 porciones" ||
    valorLower.includes("personalizado");

  panelPorcionesPedido.classList.toggle("oculto", !mostrarCalculadora);

  if (mostrarCalculadora && window.resultadoPedidoEspecial && !window.resultadoPedidoEspecial.excedeMaximo) {
    if (inputMonto) inputMonto.value = String(window.resultadoPedidoEspecial.precio);
    actualizarResumenProducto(
      window.resultadoPedidoEspecial.nombre,
      `${window.resultadoPedidoEspecial.porciones} porciones`,
      String(window.resultadoPedidoEspecial.precio)
    );
  }
}

    if (opcionesQuequeEl) {
      const esQueque = this.value.toLowerCase().includes("queque");
      if (esQueque) {
        opcionesQuequeEl.classList.remove("oculto");
        if (this.value.startsWith("Queque Personalizado")) {
          const radioPers = document.querySelector('input[name="tipo_decoracion"][value="Personalizado"]');
          if (radioPers) radioPers.checked = true;
        } else {
          const radioTrad = document.querySelector('input[name="tipo_decoracion"][value="Tradicional"]');
          if (radioTrad) radioTrad.checked = true;
        }
        actualizarPanelPersonalizado();
      } else {
        opcionesQuequeEl.classList.add("oculto");
      }
    }

    actualizarMinimoFecha();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const prodParam = urlParams.get("producto");
  if (prodParam) {
    seleccionarProducto(
      prodParam,
      urlParams.get("precio") || "Por definir",
      urlParams.get("porciones") || ""
    );
  }
}

actualizarMinimoFecha();

// 5. Ventana Modal de Detalles del Catálogo (clic y teclado)
(function () {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

  const cerrarBtn = document.getElementById("modal-cerrar");
  const ordenarBtn = document.getElementById("btn-modal-ordenar");
  const mediaEl = document.getElementById("modal-media");
  const tituloEl = document.getElementById("modal-titulo");
  const precioEl = document.getElementById("modal-precio");
  const porcionesEl = document.getElementById("modal-porciones");
  const descEl = document.getElementById("modal-descripcion");

  let datosSeleccionados = {
    producto: "",
    precioNum: "Por definir",
    porcionesNum: ""
  };

  function abrirModal(btn) {
    const tarjetaPadre = btn.closest(".card, .catalogo-card");
    const selectorBase = tarjetaPadre ? tarjetaPadre.querySelector("#base-queque-personalizado") : null;

    let productoFinal = btn.dataset.producto || btn.dataset.titulo || "";
    let tituloFinal = btn.dataset.titulo || btn.dataset.producto || "";
    let porcionesTextoFinal = btn.dataset.porciones || "";
    let porcionesNumFinal = btn.dataset.porcionesNum || porcionesTextoFinal;
    let precioTextoFinal = btn.dataset.precio || btn.dataset.precioNum || "Por definir";
    let precioNumFinal = btn.dataset.precioNum || btn.dataset.precio || "Por definir";

    if (selectorBase && selectorBase.value) {
      const optBase = selectorBase.options[selectorBase.selectedIndex];
      const baseNombre = selectorBase.value;
      const basePorc = optBase ? optBase.getAttribute("data-porciones") : "";
      const basePrecio = optBase ? optBase.getAttribute("data-precio") : "";

      productoFinal = `Queque Personalizado (${baseNombre})`;
      tituloFinal = `Queques Personalizados · ${baseNombre}`;
      if (basePorc) {
        porcionesTextoFinal = `${basePorc} porciones (base ${baseNombre})`;
        porcionesNumFinal = basePorc;
      }
      if (basePrecio) {
        precioTextoFinal = basePrecio;
        precioNumFinal = basePrecio;
      }
    }

    datosSeleccionados = {
      producto: productoFinal,
      precioNum: precioNumFinal,
      porcionesNum: porcionesNumFinal
    };

    if (tituloEl) tituloEl.textContent = tituloFinal;
    if (precioEl) precioEl.textContent = precioTextoFinal;
    if (porcionesEl) porcionesEl.textContent = porcionesTextoFinal;
    if (descEl) {
      const ingredientesBase = btn.dataset.descripcion || "";
      const rellenoExtra = btn.dataset.relleno ? ` Relleno: ${btn.dataset.relleno}.` : "";
      descEl.textContent = `${ingredientesBase}${rellenoExtra}`.trim();
    }

    if (mediaEl) {
      if (btn.dataset.imagen) {
        mediaEl.innerHTML = `<img src="${btn.dataset.imagen}" alt="${tituloFinal || "Producto"}">`;
      } else {
        mediaEl.innerHTML = `<span>${tituloFinal || "Especialidad"}</span>`;
      }
    }

    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
    if (cerrarBtn) cerrarBtn.focus();
  }

  document.querySelectorAll(".btn-ver-detalle").forEach((btn) => {
    btn.addEventListener("click", () => abrirModal(btn));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirModal(btn);
      }
    });
  });

  function cerrarModal() {
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
  }

  if (cerrarBtn) cerrarBtn.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("activo")) {
      cerrarModal();
    }
  });

  if (ordenarBtn) {
    ordenarBtn.addEventListener("click", () => {
      cerrarModal();
      if (datosSeleccionados.producto) {
        seleccionarProducto(
          datosSeleccionados.producto,
          datosSeleccionados.precioNum,
          datosSeleccionados.porcionesNum
        );
      }
    });
  }
})();

// 6. Envío del formulario a la pestaña "Pedidos" + Redirección a WhatsApp
const formularioPedidoEl = document.getElementById("formularioPedido");
if (formularioPedidoEl) {
  formularioPedidoEl.addEventListener("submit", async function (e) {
    e.preventDefault();

    actualizarMinimoFecha();
    if (inputFechaEl && inputFechaEl.min && inputFechaEl.value < inputFechaEl.min) {
      const msg = requiere48Horas()
        ? "Este queque requiere al menos 48 horas de anticipación. Por favor elige una fecha y hora posterior."
        : "Por favor selecciona una fecha y hora futura para la entrega.";
      alert(msg);
      inputFechaEl.focus();
      return;
    }

    const btn = document.getElementById("btnEnviar");
    if (btn) {
      btn.innerText = "Registrando pedido...";
      btn.disabled = true;
    }

    const idPedido = "P-" + Math.floor(1000 + Math.random() * 9000);
    let tipoProducto = document.getElementById("producto")?.value || "";
    let porcionesCalculadas = "";
    if (tipoProducto === "Queque mayor a 20 porciones") {
      if (!window.resultadoPedidoEspecial || window.resultadoPedidoEspecial.excedeMaximo) {
        alert("Ingresa una cantidad válida de porciones (hasta 105) o usa el botón de WhatsApp para cotizar tu evento grande.");
        if (btn) {
          btn.innerText = "Registrar Pedido";
          btn.disabled = false;
        }
        document.getElementById("calc-porciones-ped")?.focus();
        return;
      }
      tipoProducto = window.resultadoPedidoEspecial.nombre;
      porcionesCalculadas = `${window.resultadoPedidoEspecial.porciones} porciones`;
    }
    const rellenoSeleccionado = document.getElementById("relleno")?.value || "Leche condensada";
    const esQueque = tipoProducto.toLowerCase().includes("queque");

    let resumenOpciones = "";
    let notaImagenWhatsApp = "";

    if (esQueque) {
      const tipoDeco = document.querySelector('input[name="tipo_decoracion"]:checked')?.value || "Tradicional";
      let colorElegido = inputColorSeleccionado?.value || "Predeterminado";
      if (colorElegido === "Otro" && inputColorOtro?.value.trim()) {
        colorElegido = inputColorOtro.value.trim();
      }

      const extrasMarcados = Array.from(document.querySelectorAll('input[name="extras_queque"]:checked'))
        .map((cb) => cb.value);

      resumenOpciones = `Decoración: ${tipoDeco} | Color: ${colorElegido}`;

      if (tipoDeco === "Personalizado") {
        if (extrasMarcados.length > 0) {
          resumenOpciones += ` | Extras: ${extrasMarcados.join(", ")}`;
        }
        const opcionImagen = document.getElementById("imagen_whatsapp")?.value || "No";
        if (opcionImagen !== "No") {
          resumenOpciones += ` | Imagen: ${opcionImagen}`;
          notaImagenWhatsApp = `\n📎 *Imagen:* ${opcionImagen} (la adjunto a continuación).`;
        }
      }
    }

    const detallesUsuario = document.getElementById("detalles")?.value.trim() || "";
    const partesDetalles = [`Relleno: ${rellenoSeleccionado}`];
    if (resumenOpciones) partesDetalles.push(resumenOpciones);
    if (detallesUsuario) partesDetalles.push(detallesUsuario);
    const detallesCompletos = partesDetalles.join(" — ");

    const opcionActual = selectProductoEl?.options[selectProductoEl.selectedIndex];
    const porcionesRef = porcionesCalculadas || (opcionActual ? (opcionActual.getAttribute("data-porciones") || "N/A") : "N/A");

    const datosPedido = {
      accion: "nuevo_pedido",
      id_pedido: idPedido,
      nombre_cliente: document.getElementById("nombre")?.value.trim() || "",
      telefono: document.getElementById("telefono")?.value.trim() || "",
      fecha_entrega: inputFechaEl?.value || "",
      tipo_producto: tipoProducto,
      relleno: rellenoSeleccionado,
      detalles_producto: detallesCompletos,
      porciones: porcionesRef,
      metodo_entrega: document.getElementById("entrega")?.value || "",
      monto_total: document.getElementById("monto_estimado")?.value || "Por definir",
      estado_pago: "Pendiente (Web)"
    };

    const fechaLegible = datosPedido.fecha_entrega.replace("T", " a las ");

    const mensajeWhatsApp =
      `¡Hola Pastelería Las Esmeraldas! 🎂 Acabo de registrar mi pedido en la página web:\n\n` +
      `📌 *Orden:* ${datosPedido.id_pedido}\n` +
      `👤 *Cliente:* ${datosPedido.nombre_cliente}\n` +
      `📞 *Teléfono:* ${datosPedido.telefono}\n` +
      `🍰 *Producto:* ${datosPedido.tipo_producto}\n` +
      `🍯 *Relleno:* ${datosPedido.relleno}\n` +
      (resumenOpciones ? `🎨 *Opciones:* ${resumenOpciones}\n` : "") +
      `📅 *Entrega:* ${fechaLegible}\n` +
      `🚚 *Modalidad:* ${datosPedido.metodo_entrega}\n` +
      `📝 *Detalles:* ${detallesUsuario}${notaImagenWhatsApp}\n\n` +
      `Quedo atento(a) para confirmar el monto y realizar el adelanto por SINPE Móvil.`;

    const urlWhatsApp = `https://wa.me/${TELEFONO_WA_COMPLETO}?text=${encodeURIComponent(mensajeWhatsApp)}`;

    try {
      await fetch(URL_API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datosPedido)
      });

      alert(`¡Gracias ${datosPedido.nombre_cliente}! Tu pedido (${idPedido}) quedó agendado. Ahora se abrirá WhatsApp para confirmar los detalles.`);

      formularioPedidoEl.reset();
      const rellenoEl = document.getElementById("relleno");
      if (rellenoEl) rellenoEl.value = "Leche condensada";
      const montoEl = document.getElementById("monto_estimado");
      if (montoEl) montoEl.value = "Por definir";
     if (opcionesQuequeEl) opcionesQuequeEl.classList.add("oculto");
      if (panelPersonalizadoEl) panelPersonalizadoEl.classList.add("oculto");
      if (inputColorSeleccionado) inputColorSeleccionado.value = "";
      if (inputColorOtro) inputColorOtro.classList.add("oculto");
      if (textoColorElegido) {
        textoColorElegido.innerHTML = 'Color seleccionado: <strong>Sin seleccionar</strong>';
      }
      botonesColor.forEach((b) => b.classList.remove("activo"));
      window.resultadoPedidoEspecial = null;
      document.getElementById("panel-porciones-pedido")?.classList.add("oculto");
      document.getElementById("calc-resultado-ped")?.classList.add("oculto");
      document.getElementById("calc-manual-wrap-ped")?.classList.add("oculto");
      actualizarResumenProducto("", "");

      window.location.href = urlWhatsApp;
    } catch (error) {
      alert("Hubo un inconveniente al registrar en el sistema, pero te redirigiremos a WhatsApp para atender tu pedido.");
      console.error("Error al registrar pedido:", error);
      window.location.href = urlWhatsApp;
    } finally {
      if (btn) {
        btn.innerText = "Registrar Pedido";
        btn.disabled = false;
      }
    }
  });
}

// 7. Ubicación: enlace automático de WhatsApp y copiar dirección
(function () {
  const textoDireccion = document.getElementById("texto-direccion");
  const linkWhatsappUbicacion = document.getElementById("link-whatsapp-ubicacion");
  const btnCopiarDireccion = document.getElementById("btn-copiar-direccion");

  const direccionTexto = textoDireccion ? textoDireccion.textContent.trim() : "Desamparados, San José, Costa Rica";

  if (linkWhatsappUbicacion) {
    const mensajeUbicacion = `¡Hola Pastelería Las Esmeraldas! Me gustaría que me compartan la ubicación o el pin del local (${direccionTexto}).`;
    linkWhatsappUbicacion.href = `https://wa.me/${TELEFONO_WA_COMPLETO}?text=${encodeURIComponent(mensajeUbicacion)}`;
  }

  if (btnCopiarDireccion && textoDireccion) {
    btnCopiarDireccion.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(direccionTexto);
        const textoOriginal = btnCopiarDireccion.textContent;
        btnCopiarDireccion.textContent = "¡Dirección copiada!";
        setTimeout(() => {
          btnCopiarDireccion.textContent = textoOriginal;
        }, 2000);
      } catch {
        btnCopiarDireccion.textContent = "Selecciona y copia";
      }
    });
  }
})();

  // 8. Filtros de categorías tipo pestaña en el Catálogo y Personalizados
(function () {
  const navWrap = document.getElementById("catalogoNavegacionWrap");
  if (!navWrap) return;

  const botonesFiltro = navWrap.querySelectorAll(".filtro-btn");
  const tarjetasCatalogo = document.querySelectorAll(".catalogo-card");
  const navbarEl = document.querySelector(".navbar");
  const seccionFinFijo =
    document.getElementById("sec-sabores") ||
    document.querySelector(".catalogo-personalizados-puente");

  // Si existen tarjetas de catálogo, calcular conteos y activar filtrado
  if (botonesFiltro.length && tarjetasCatalogo.length) {
    const conteos = { todos: tarjetasCatalogo.length };
    tarjetasCatalogo.forEach((tarjeta) => {
      const cat = tarjeta.dataset.categoria;
      if (cat) {
        conteos[cat] = (conteos[cat] || 0) + 1;
      }
    });

    botonesFiltro.forEach((boton) => {
      const filtro = boton.dataset.filtro;
      const spanConteo = boton.querySelector(".filtro-conteo");
      if (spanConteo && typeof conteos[filtro] === "number") {
        spanConteo.textContent = `(${conteos[filtro]})`;
      }
    });

    function aplicarFiltro(categoriaSeleccionada) {
      botonesFiltro.forEach((btn) => {
        btn.classList.toggle("activo", btn.dataset.filtro === categoriaSeleccionada);
      });

      tarjetasCatalogo.forEach((tarjeta) => {
        const debeMostrar =
          categoriaSeleccionada === "todos" ||
          tarjeta.dataset.categoria === categoriaSeleccionada;

        tarjeta.classList.toggle("oculta", !debeMostrar);
      });
    }

    botonesFiltro.forEach((boton) => {
      boton.addEventListener("click", () => {
        aplicarFiltro(boton.dataset.filtro || "todos");
      });
    });

    aplicarFiltro("todos");
  }

  // En páginas con enlaces de sección (#sec-...), resaltar pestaña activa al hacer scroll
  const enlacesSeccion = Array.from(navWrap.querySelectorAll('a[href^="#"]'));
  function actualizarPestanaActivaPorScroll() {
    if (!enlacesSeccion.length) return;
    const referenciaY = window.scrollY + 260;
    const primerHref = enlacesSeccion[0].getAttribute("href") || "";
    let activaId = primerHref.startsWith("#") ? primerHref.slice(1) : "";

    enlacesSeccion.forEach((enlace) => {
      const href = enlace.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const id = href.slice(1);
      const seccion = document.getElementById(id);
      if (seccion && seccion.offsetTop <= referenciaY) {
        activaId = id;
      }
    });

    enlacesSeccion.forEach((enlace) => {
      const esActiva = enlace.getAttribute("href") === `#${activaId}`;
      enlace.classList.toggle("activo", esActiva);
    });
  }

  // Espaciador invisible para evitar saltos bruscos cuando la barra se vuelve fixed
  let espaciador = null;
  if (navWrap.parentNode) {
    espaciador = document.createElement("div");
    espaciador.style.display = "none";
    navWrap.parentNode.insertBefore(espaciador, navWrap.nextSibling);
  }

  function actualizarBarraScroll() {
    const alturaNavbar = navbarEl
      ? Math.round(navbarEl.getBoundingClientRect().height)
      : (window.innerWidth <= 820 ? 158 : 176);

    const rectWrap = espaciador && navWrap.classList.contains("fijada-bajo-logo")
      ? espaciador.getBoundingClientRect()
      : navWrap.getBoundingClientRect();

    const debeFijarse = rectWrap.top <= alturaNavbar;

    let alcanzoLimiteSeccion = false;
    if (seccionFinFijo) {
      const rectLimite = seccionFinFijo.getBoundingClientRect();
      alcanzoLimiteSeccion = rectLimite.top <= alturaNavbar + 60;
    }

    if (debeFijarse && !alcanzoLimiteSeccion) {
      if (espaciador && !navWrap.classList.contains("fijada-bajo-logo")) {
        espaciador.style.display = "block";
        espaciador.style.height = `${Math.round(navWrap.getBoundingClientRect().height)}px`;
      }
      navWrap.classList.add("fijada-bajo-logo");
      navWrap.classList.remove("oculta-por-seccion");
      navWrap.style.top = `${alturaNavbar}px`;
    } else {
      navWrap.classList.remove("fijada-bajo-logo");
      navWrap.style.top = "";
      if (espaciador) {
        espaciador.style.display = "none";
        espaciador.style.height = "0px";
      }
      navWrap.classList.toggle("oculta-por-seccion", alcanzoLimiteSeccion);
    }

    actualizarPestanaActivaPorScroll();
  }

  window.addEventListener("scroll", actualizarBarraScroll, { passive: true });
  window.addEventListener("resize", actualizarBarraScroll);
  window.addEventListener("load", actualizarBarraScroll);
  actualizarBarraScroll();
})();

// 9. Calculadora de porciones y pisos (Catálogo y Pedidos)
(function () {
  const MOLDES = [
    { id: "pequeno", nombre: "Queque Pequeño", porciones: 12, precio: 10500 },
    { id: "mediano", nombre: "Queque Mediano", porciones: 14, precio: 13000 },
    { id: "grande", nombre: "Queque Grande", porciones: 20, precio: 17000 },
    { id: "q20", nombre: "Queque 20", porciones: 25, precio: 20000 },
    { id: "q24", nombre: "Queque 24", porciones: 30, precio: 24000 },
    { id: "q28", nombre: "Queque 28", porciones: 35, precio: 28000 },
    { id: "q32", nombre: "Queque 32", porciones: 40, precio: 32000 }
  ];

  const MAX_PORCIONES = 105; // Queque 32 (40) + Queque 28 (35) + Queque 24 (30)
  window.resultadoPedidoEspecial = null;

  function formatoColones(monto) {
    return `₡${Number(monto).toLocaleString("es-CR")}`;
  }

  function armarResultado(pisos) {
    const porciones = pisos.reduce((acc, m) => acc + m.porciones, 0);
    const precio = pisos.reduce((acc, m) => acc + m.precio, 0);
    const nombre =
      pisos.length === 1
        ? pisos[0].nombre
        : `Queque ${pisos.length} pisos · ${pisos.map((m) => m.nombre).join(" + ")}`;
    return { excedeMaximo: false, pisos, nombre, porciones, precio };
  }

  function calcularAutomatico(porcionesDeseadas, forzarVariosPisos) {
    const n = Number(porcionesDeseadas);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n > MAX_PORCIONES) return { excedeMaximo: true, porcionesDeseadas: n };

    if (n <= 40 && !forzarVariosPisos) {
      const molde = MOLDES.find((m) => m.porciones >= n);
      return armarResultado([molde]);
    }

    const candidatos = [];
    if (n <= 75) {
      for (let i = 1; i < MOLDES.length; i++) {
        for (let j = 0; j < i; j++) {
          const pisos = [MOLDES[i], MOLDES[j]];
          const res = armarResultado(pisos);
          if (res.porciones >= n) {
            candidatos.push({ ...res, separacion: i - j });
          }
        }
      }
    } else {
      for (let i = 2; i < MOLDES.length; i++) {
        for (let j = 1; j < i; j++) {
          for (let k = 0; k < j; k++) {
            const pisos = [MOLDES[i], MOLDES[j], MOLDES[k]];
            const res = armarResultado(pisos);
            if (res.porciones >= n) {
              candidatos.push({ ...res, separacion: i - k });
            }
          }
        }
      }
    }

    candidatos.sort(
      (a, b) =>
        a.porciones - b.porciones ||
        a.precio - b.precio ||
        b.separacion - a.separacion
    );

    return candidatos[0] || null;
  }

  function iniciarCalculadora(prefijo, esCatalogo) {
    const inputPorc = document.getElementById(`calc-porciones-${prefijo}`);
    const checkPisos = document.getElementById(`calc-pisos-${prefijo}`);
    const cajaResultado = document.getElementById(`calc-resultado-${prefijo}`);
    const wrapManual = document.getElementById(`calc-manual-wrap-${prefijo}`);
    const sel1 = document.getElementById(`calc-piso1-${prefijo}`);
    const sel2 = document.getElementById(`calc-piso2-${prefijo}`);
    const sel3 = document.getElementById(`calc-piso3-${prefijo}`);

    if (!inputPorc || !checkPisos || !cajaResultado || !sel1 || !sel2 || !sel3) return;

    function llenarOpciones(selectEl, maxIndiceExclusivo, incluirNinguno) {
      const valorPrevio = selectEl.value;
      selectEl.innerHTML = "";
      if (incluirNinguno) {
        selectEl.add(new Option("Ninguno", ""));
      }
      for (let i = maxIndiceExclusivo - 1; i >= 0; i--) {
        const m = MOLDES[i];
        selectEl.add(new Option(`${m.nombre} (${m.porciones} porc · ${formatoColones(m.precio)})`, String(i)));
      }
      if (Array.from(selectEl.options).some((o) => o.value === valorPrevio)) {
        selectEl.value = valorPrevio;
      }
    }

    llenarOpciones(sel1, MOLDES.length, false);

    function sincronizarSelects(pisos) {
      const idx1 = MOLDES.findIndex((m) => m.id === pisos[0].id);
      sel1.value = String(idx1);
      llenarOpciones(sel2, idx1, true);

      if (pisos[1]) {
        const idx2 = MOLDES.findIndex((m) => m.id === pisos[1].id);
        sel2.value = String(idx2);
        llenarOpciones(sel3, idx2, true);
        if (pisos[2]) {
          const idx3 = MOLDES.findIndex((m) => m.id === pisos[2].id);
          sel3.value = String(idx3);
        } else {
          sel3.value = "";
        }
      } else {
        sel2.value = "";
        llenarOpciones(sel3, 0, true);
        sel3.value = "";
      }
    }

    function renderizar(resultado) {
      if (!resultado) {
        cajaResultado.classList.add("oculto");
        if (wrapManual) wrapManual.classList.add("oculto");
        if (!esCatalogo) window.resultadoPedidoEspecial = null;
        return;
      }

      cajaResultado.classList.remove("oculto");

      if (resultado.excedeMaximo) {
        if (wrapManual) wrapManual.classList.add("oculto");
        if (!esCatalogo) window.resultadoPedidoEspecial = resultado;
        const msgWa = `¡Hola Pastelería Las Esmeraldas! Necesito cotizar un queque para evento grande de aproximadamente ${resultado.porcionesDeseadas} porciones.`;
        const linkWa = `https://wa.me/${TELEFONO_WA_COMPLETO}?text=${encodeURIComponent(msgWa)}`;
        cajaResultado.innerHTML = `
          <span class="calc-resultado-titulo">Evento grande (${resultado.porcionesDeseadas} porciones)</span>
          <p class="calc-resultado-meta">Para más de ${MAX_PORCIONES} porciones (máximo 3 pisos) preparamos una cotización a medida o montaje combinado.</p>
          <div class="calc-resultado-acciones">
            <a href="${linkWa}" target="_blank" rel="noopener noreferrer" class="btn btn-primario">Cotizar por WhatsApp</a>
          </div>
        `;
        return;
      }

      if (wrapManual) wrapManual.classList.remove("oculto");

      const botonCatalogo = esCatalogo
        ? `<div class="calc-resultado-acciones">
             <button type="button" class="btn btn-primario" id="btn-ordenar-calc-${prefijo}">Ordenar este tamaño</button>
           </div>`
        : "";

      cajaResultado.innerHTML = `
        <span class="calc-resultado-titulo">${resultado.nombre}</span>
        <p class="calc-resultado-meta"><strong>Cubre:</strong> ${resultado.porciones} porciones · <strong>Base tradicional:</strong> ${formatoColones(resultado.precio)}</p>
        <p class="calc-resultado-nota">Precio base en decoración tradicional. Los diseños personalizados se cotizan sobre esta base al confirmar por WhatsApp. Requiere mínimo 48 horas.</p>
        ${botonCatalogo}
      `;

      if (esCatalogo) {
        const btnOrdenar = document.getElementById(`btn-ordenar-calc-${prefijo}`);
        if (btnOrdenar) {
          btnOrdenar.addEventListener("click", () => {
            seleccionarProducto(
              resultado.nombre,
              String(resultado.precio),
              `${resultado.porciones} porciones`
            );
          });
        }
      } else {
        window.resultadoPedidoEspecial = resultado;
        const inputMonto = document.getElementById("monto_estimado");
        if (inputMonto) inputMonto.value = String(resultado.precio);
        if (typeof actualizarResumenProducto === "function") {
          actualizarResumenProducto(
            resultado.nombre,
            `${resultado.porciones} porciones`,
            String(resultado.precio)
          );
        }
      }
    }

    function recalcularDesdeInput() {
      const res = calcularAutomatico(inputPorc.value, checkPisos.checked);
      if (res && !res.excedeMaximo) {
        sincronizarSelects(res.pisos);
      }
      renderizar(res);
    }

    function recalcularDesdeManual() {
      const idx1 = Number(sel1.value);
      llenarOpciones(sel2, idx1, true);
      const pisos = [MOLDES[idx1]];

      if (sel2.value !== "") {
        const idx2 = Number(sel2.value);
        pisos.push(MOLDES[idx2]);
        llenarOpciones(sel3, idx2, true);
        if (sel3.value !== "") {
          pisos.push(MOLDES[Number(sel3.value)]);
        }
      } else {
        llenarOpciones(sel3, 0, true);
        sel3.value = "";
      }

      renderizar(armarResultado(pisos));
    }

    inputPorc.addEventListener("input", recalcularDesdeInput);
    checkPisos.addEventListener("change", recalcularDesdeInput);
    sel1.addEventListener("change", recalcularDesdeManual);
    sel2.addEventListener("change", recalcularDesdeManual);
    sel3.addEventListener("change", recalcularDesdeManual);
  }

  iniciarCalculadora("cat", true);
  iniciarCalculadora("ped", false);
})();

// Mantener visible el subrayado en el enlace de la página actual
document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  const enlacesNav = document.querySelectorAll(".navbar a:not(.logo-link)");

  enlacesNav.forEach((enlace) => {
    const href = enlace.getAttribute("href") || "";
    const destino = href.split("/").pop().split("#")[0].split("?")[0];

    if (destino === paginaActual) {
      enlace.classList.add("activo");
      enlace.setAttribute("aria-current", "page");
    }
  });
});

// Interactividad de Favoritos de la Casa (Mosaico 2x2)
document.addEventListener("DOMContentLoaded", () => {

  // Navbar integrada al Hero que pasa a fija al hacer scroll
const navbarHero = document.getElementById("navbarPrincipal");
if (navbarHero && navbarHero.classList.contains("navbar-hero")) {
  const actualizarNavbarScroll = () => {
    if (window.scrollY > 60) {
      navbarHero.classList.add("navbar--fija");
    } else {
      navbarHero.classList.remove("navbar--fija");
    }
  };

  actualizarNavbarScroll();
  window.addEventListener("scroll", actualizarNavbarScroll, { passive: true });
}

  const tiles = document.querySelectorAll(".favorito-tile");
  if (!tiles.length) return;

  const titulo = document.getElementById("fav-titulo");
  const descripcion = document.getElementById("fav-descripcion");
  const hint = document.getElementById("fav-hint");
  const detalles = document.getElementById("fav-detalles");
  const porciones = document.getElementById("fav-porciones");
  const relleno = document.getElementById("fav-relleno");
  const precio = document.getElementById("fav-precio");
  const tiempo = document.getElementById("fav-tiempo");
  const btnOrdenar = document.getElementById("fav-btn-ordenar");

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      tiles.forEach((t) => t.classList.remove("activo"));
      tile.classList.add("activo");

      titulo.textContent = tile.dataset.producto || "";
      descripcion.textContent = tile.dataset.descripcion || "";
      porciones.textContent = tile.dataset.porciones || "";
      relleno.textContent = tile.dataset.relleno || "";
      precio.textContent = tile.dataset.precio || "";
      tiempo.textContent = tile.dataset.tiempo || "";

      hint.hidden = true;
      detalles.hidden = false;
      btnOrdenar.hidden = false;

      // Envía los datos seleccionados a pedidos.html
      const params = new URLSearchParams({
        producto: tile.dataset.producto || "",
        porciones: tile.dataset.porcionesNum || "",
        precio: tile.dataset.precioNum || ""
      });
      btnOrdenar.href = `pedidos.html?${params.toString()}`;
    });
  });
});

// Alternar relleno artesanal según tipo de decoración en pedidos.html
document.addEventListener("DOMContentLoaded", () => {
  const radiosDecoracion = document.querySelectorAll('input[name="tipo_decoracion"]');
  const notaTradicional = document.getElementById("relleno-tradicional-nota");
  const grupoPersonalizado = document.getElementById("relleno-personalizado-grupo");
  const selectRelleno = document.getElementById("relleno");

  if (!radiosDecoracion.length || !notaTradicional || !grupoPersonalizado) return;

  function actualizarRelleno() {
    const activo = document.querySelector('input[name="tipo_decoracion"]:checked');
    const esPersonalizado = activo && activo.value === "Personalizado";

    notaTradicional.classList.toggle("oculto", esPersonalizado);
    grupoPersonalizado.classList.toggle("oculto", !esPersonalizado);

    if (!esPersonalizado && selectRelleno) {
      selectRelleno.value = "Leche condensada";
    }
  }

  radiosDecoracion.forEach((radio) => {
    radio.addEventListener("change", actualizarRelleno);
  });

  actualizarRelleno();
});

// Cambiar imagen de vista previa en pedidos.html al marcar "varios pisos"
document.addEventListener("DOMContentLoaded", () => {
  const checkPisos = document.getElementById("calc-pisos-ped");
  const selectProducto = document.getElementById("producto");
  const imgResumen = document.getElementById("resumen-producto-img");

  if (!checkPisos || !imgResumen) return;

  const IMG_VARIOS_PISOS = "img/personalizados/dospisos.webp"; // Ajusta al nombre real de tu archivo
  const IMG_BASE_GRANDE = "img/catalogo/especiales.webp"; // Foto al desmarcar la casilla

  function actualizarImagenPisos() {
    if (checkPisos.checked) {
      imgResumen.src = IMG_VARIOS_PISOS;
      imgResumen.alt = "Queque de varios pisos";
    } else if (selectProducto) {
      const producto = selectProducto.value;
      const rutaOriginal =
        (typeof IMAGENES_PEDIDO !== "undefined" && IMAGENES_PEDIDO[producto]) ||
        IMG_BASE_GRANDE;
      imgResumen.src = rutaOriginal;
      imgResumen.alt = `Imagen de ${producto || "queque seleccionado"}`;
    }
  }

  checkPisos.addEventListener("change", actualizarImagenPisos);
});