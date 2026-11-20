// 1. Configuración de conexión y WhatsApp
const URL_API = "https://script.google.com/macros/s/AKfycbxQ5XnJ81qF-GYzdHcl6GYG8FNX1Wj4l3fGw7b9Ymu8IAtRwnx7z56Dsw8-d_4lV7RsRg/exec";
const NUMERO_WHATSAPP = "84267372";

// 2. Función para llevar un producto elegido al formulario de pedidos
function seleccionarProducto(nombreProducto, precioBase, porcionesSugeridas) {
  const selectProducto = document.getElementById("producto");
  const inputMonto = document.getElementById("monto_estimado");
  const inputPorciones = document.getElementById("porciones");

  if (!selectProducto) return;

  let existeOpcion = Array.from(selectProducto.options).some(
    (opt) => opt.value === nombreProducto
  );

  if (!existeOpcion) {
    const nuevaOpcion = new Option(nombreProducto, nombreProducto);
    selectProducto.add(nuevaOpcion);
  }

  selectProducto.value = nombreProducto;

  // Dispara el cambio para que actualice las porciones según el <select>
  selectProducto.dispatchEvent(new Event("change"));

  if (porcionesSugeridas && inputPorciones) {
    inputPorciones.value = porcionesSugeridas;
  }

  if (inputMonto) {
    inputMonto.value = precioBase || "Por definir";
  }

  const seccionPedidos = document.getElementById("pedidos");
  if (seccionPedidos) {
    seccionPedidos.scrollIntoView({ behavior: "smooth" });
  }
}

// 3. Auto-ajustar porciones, monto y mostrar opciones de color/decoración si es Queque
const selectProductoEl = document.getElementById("producto");
const opcionesQuequeEl = document.getElementById("opciones-queque");
const panelPersonalizadoEl = document.getElementById("panel-personalizado");
const radiosDecoracion = document.querySelectorAll('input[name="tipo_decoracion"]');
const botonesColor = document.querySelectorAll(".color-btn");
const inputColorSeleccionado = document.getElementById("color_seleccionado");
const inputColorOtro = document.getElementById("color_otro");

function actualizarPanelPersonalizado() {
  const seleccionado = document.querySelector('input[name="tipo_decoracion"]:checked');
  if (seleccionado && seleccionado.value === "Personalizado") {
    panelPersonalizadoEl.classList.remove("oculto");
  } else {
    panelPersonalizadoEl.classList.add("oculto");
  }
}

radiosDecoracion.forEach((radio) => {
  radio.addEventListener("change", actualizarPanelPersonalizado);
});

botonesColor.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesColor.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");

    const color = btn.dataset.color;
    inputColorSeleccionado.value = color;

    if (color === "Otro") {
      inputColorOtro.classList.remove("oculto");
      inputColorOtro.focus();
    } else {
      inputColorOtro.classList.add("oculto");
      inputColorOtro.value = "";
    }
  });
});

selectProductoEl.addEventListener("change", function () {
  const opcionSeleccionada = this.options[this.selectedIndex];
  if (!opcionSeleccionada) return;

  const porcionesSugeridas = opcionSeleccionada.getAttribute("data-porciones");
  const precioBase = opcionSeleccionada.getAttribute("data-precio");
  const inputMonto = document.getElementById("monto_estimado");

  if (inputMonto) {
    inputMonto.value = precioBase || "Por definir";
  }

  // Mostrar opciones de color/decoración solo si es un Queque
  const esQueque = this.value.toLowerCase().includes("queque");
  if (esQueque) {
    opcionesQuequeEl.classList.remove("oculto");
    if (this.value === "Queque Personalizado") {
      document.querySelector('input[name="tipo_decoracion"][value="Personalizado"]').checked = true;
    } else {
      document.querySelector('input[name="tipo_decoracion"][value="Tradicional"]').checked = true;
    }
    actualizarPanelPersonalizado();
  } else {
    opcionesQuequeEl.classList.add("oculto");
  }
});

// 4. Ventana Modal de Detalles del Catálogo
(function () {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

  const cerrarBtn = document.getElementById("modal-cerrar");
  const ordenarBtn = document.getElementById("btn-modal-ordenar");
  const mediaEl = document.getElementById("modal-media");
  const etiquetaEl = document.getElementById("modal-etiqueta");
  const tituloEl = document.getElementById("modal-titulo");
  const descEl = document.getElementById("modal-descripcion");
  const porcionesEl = document.getElementById("modal-porciones");
  const rellenoRowEl = document.getElementById("modal-relleno-row");
  const rellenoEl = document.getElementById("modal-relleno");
  const precioEl = document.getElementById("modal-precio");
  const tiempoEl = document.getElementById("modal-tiempo");

  let datosSeleccionados = {
    producto: "",
    precioNum: "Por definir",
    porcionesNum: ""
  };

  document.querySelectorAll(".btn-ver-detalle").forEach((btn) => {
    btn.addEventListener("click", () => {
      datosSeleccionados = {
        producto: btn.dataset.producto || "",
        precioNum: btn.dataset.precioNum || "Por definir",
        porcionesNum: btn.dataset.porcionesNum || ""
      };

      etiquetaEl.textContent = btn.dataset.etiqueta || "";
      tituloEl.textContent = btn.dataset.titulo || "";
      descEl.textContent = btn.dataset.descripcion || "";
      porcionesEl.textContent = btn.dataset.porciones || "";
      precioEl.textContent = btn.dataset.precio || "";
      tiempoEl.textContent = btn.dataset.tiempo || "";

      if (btn.dataset.relleno) {
        rellenoEl.textContent = btn.dataset.relleno;
        rellenoRowEl.classList.remove("oculto");
      } else {
        rellenoRowEl.classList.add("oculto");
      }

      if (btn.dataset.imagen) {
        mediaEl.innerHTML = `<img src="${btn.dataset.imagen}" alt="${btn.dataset.titulo || "Producto"}">`;
      } else {
        mediaEl.innerHTML = `<span>${btn.dataset.titulo || "Especialidad"}</span>`;
      }

      modal.classList.add("activo");
      modal.setAttribute("aria-hidden", "false");
    });
  });

  function cerrarModal() {
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
  }

  cerrarBtn.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("activo")) {
      cerrarModal();
    }
  });

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
})();

// 5. Envío del formulario a la pestaña "Pedidos" + Redirección a WhatsApp
document.getElementById("formularioPedido").addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = document.getElementById("btnEnviar");
  btn.innerText = "Registrando pedido...";
  btn.disabled = true;

  const idPedido = "P-" + Math.floor(1000 + Math.random() * 9000);
  const tipoProducto = document.getElementById("producto").value;
  const esQueque = tipoProducto.toLowerCase().includes("queque");

  let resumenOpciones = "";
  let notaImagenWhatsApp = "";

  if (esQueque) {
    const tipoDeco = document.querySelector('input[name="tipo_decoracion"]:checked')?.value || "Tradicional";
    let colorElegido = inputColorSeleccionado.value;
    if (colorElegido === "Otro" && inputColorOtro.value.trim()) {
      colorElegido = inputColorOtro.value.trim();
    }

    const extrasMarcados = Array.from(document.querySelectorAll('input[name="extras_queque"]:checked'))
      .map((cb) => cb.value);

    resumenOpciones = `Decoración: ${tipoDeco} | Color: ${colorElegido}`;

    if (tipoDeco === "Personalizado") {
      if (extrasMarcados.length > 0) {
        resumenOpciones += ` | Extras: ${extrasMarcados.join(", ")}`;
      }
      const opcionImagen = document.getElementById("imagen_whatsapp").value;
      if (opcionImagen !== "No") {
        resumenOpciones += ` | Imagen: ${opcionImagen}`;
        notaImagenWhatsApp = `\n📎 *Imagen:* ${opcionImagen} (la adjunto a continuación).`;
      }
    }
  }

  const detallesUsuario = document.getElementById("detalles").value.trim();
  const detallesCompletos = resumenOpciones
    ? `[${resumenOpciones}] — ${detallesUsuario}`
    : detallesUsuario;

  const opcionActual = selectProductoEl.options[selectProductoEl.selectedIndex];
  const porcionesRef = opcionActual ? (opcionActual.getAttribute("data-porciones") || "N/A") : "N/A";

  const datosPedido = {
    accion: "nuevo_pedido",
    id_pedido: idPedido,
    nombre_cliente: document.getElementById("nombre").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    fecha_entrega: document.getElementById("fecha").value,
    tipo_producto: tipoProducto,
    detalles_producto: detallesCompletos,
    porciones: porcionesRef,
    metodo_entrega: document.getElementById("entrega").value,
    monto_total: document.getElementById("monto_estimado").value,
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

  const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensajeWhatsApp)}`;

  try {
    await fetch(URL_API, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(datosPedido)
    });

    alert(`¡Gracias ${datosPedido.nombre_cliente}! Tu pedido (${idPedido}) quedó agendado. Ahora se abrirá WhatsApp para confirmar los detalles.`);

    document.getElementById("formularioPedido").reset();
    document.getElementById("monto_estimado").value = "Por definir";
    opcionesQuequeEl.classList.add("oculto");
    panelPersonalizadoEl.classList.add("oculto");
    inputColorOtro.classList.add("oculto");

    window.location.href = urlWhatsApp;
  } catch (error) {
    alert("Hubo un inconveniente al registrar en el sistema, pero te redirigiremos a WhatsApp para atender tu pedido.");
    console.error("Error al registrar pedido:", error);
    window.location.href = urlWhatsApp;
  } finally {
    btn.innerText = "Registrar Pedido";
    btn.disabled = false;
  }
});