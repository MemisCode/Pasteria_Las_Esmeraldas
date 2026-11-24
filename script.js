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
  const inputPorciones = document.getElementById("porciones");
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
    selectProducto.add(nuevaOpcion);
    valorFinalSelect = nombreProducto;
  }

  if (valorFinalSelect) {
    selectProducto.value = valorFinalSelect;
  }

  selectProducto.dispatchEvent(new Event("change"));

  if (porcionesSugeridas && inputPorciones) {
    inputPorciones.value = porcionesSugeridas;
  }

  if (inputMonto) {
    inputMonto.value = precioBase || "Por definir";
  }

  if (detalleEstilo && inputDetalles && !inputDetalles.value.trim()) {
    inputDetalles.value = `Estilo / ocasión: ${detalleEstilo}. Relleno deseado: `;
  }

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
const inputFechaEl = document.getElementById("fecha");
const avisoFechaEl = document.getElementById("aviso-fecha");

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
  const esQueque = prod.toLowerCase().includes("queque");
  const deco = document.querySelector('input[name="tipo_decoracion"]:checked')?.value;
  return PRODUCTOS_48H.includes(prod) || (esQueque && deco === "Personalizado");
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
  if (seleccionado && seleccionado.value === "Personalizado") {
    panelPersonalizadoEl.classList.remove("oculto");
  } else {
    panelPersonalizadoEl.classList.add("oculto");
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
    const tipoProducto = document.getElementById("producto")?.value || "";
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
    const detallesCompletos = resumenOpciones
      ? `[${resumenOpciones}] — ${detallesUsuario}`
      : detallesUsuario;

    const opcionActual = selectProductoEl?.options[selectProductoEl.selectedIndex];
    const porcionesRef = opcionActual ? (opcionActual.getAttribute("data-porciones") || "N/A") : "N/A";

    const datosPedido = {
      accion: "nuevo_pedido",
      id_pedido: idPedido,
      nombre_cliente: document.getElementById("nombre")?.value.trim() || "",
      telefono: document.getElementById("telefono")?.value.trim() || "",
      fecha_entrega: inputFechaEl?.value || "",
      tipo_producto: tipoProducto,
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
      const montoEl = document.getElementById("monto_estimado");
      if (montoEl) montoEl.value = "Por definir";
      if (opcionesQuequeEl) opcionesQuequeEl.classList.add("oculto");
      if (panelPersonalizadoEl) panelPersonalizadoEl.classList.add("oculto");
      if (inputColorOtro) inputColorOtro.classList.add("oculto");

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