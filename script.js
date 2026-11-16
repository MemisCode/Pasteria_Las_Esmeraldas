// 1. Configuración de conexión y WhatsApp
const URL_API = "https://script.google.com/macros/s/AKfycbxQ5XnJ81qF-GYzdHcl6GYG8FNX1Wj4l3fGw7b9Ymu8IAtRwnx7z56Dsw8-d_4lV7RsRg/exec";
const NUMERO_WHATSAPP = "84267372";

// 2. Función que se activa al tocar un producto de las tarjetas del catálogo
function seleccionarProducto(nombreProducto, precioBase) {
  const selectProducto = document.getElementById("producto");
  const inputMonto = document.getElementById("monto_estimado");

  // Si el producto del catálogo no está en la lista del <select>, lo agrega
  let existeOpcion = Array.from(selectProducto.options).some(opt => opt.value === nombreProducto);
  if (!existeOpcion) {
    const nuevaOpcion = new Option(nombreProducto, nombreProducto);
    selectProducto.add(nuevaOpcion);
  }

  selectProducto.value = nombreProducto;
  inputMonto.value = precioBase;

  // Dispara el cambio para que también actualice las porciones sugeridas
  selectProducto.dispatchEvent(new Event("change"));

  // Desplaza suavemente la pantalla hacia el formulario
  document.getElementById("pedidos").scrollIntoView({ behavior: "smooth" });
}

// 3. Auto-ajustar porciones sugeridas cuando el cliente elige un producto del desplegable
document.getElementById("producto").addEventListener("change", function() {
  const opcionSeleccionada = this.options[this.selectedIndex];
  const porcionesSugeridas = opcionSeleccionada.getAttribute("data-porciones");
  if (porcionesSugeridas) {
    document.getElementById("porciones").value = porcionesSugeridas;
  }
});

// 4. Envío del formulario a la pestaña "Pedidos" + Redirección a WhatsApp
document.getElementById("formularioPedido").addEventListener("submit", async function(e) {
  e.preventDefault();

  const btn = document.getElementById("btnEnviar");
  btn.innerText = "Registrando pedido...";
  btn.disabled = true;

  const idPedido = "P-" + Math.floor(1000 + Math.random() * 9000);

  const datosPedido = {
    accion: "nuevo_pedido",
    id_pedido: idPedido,
    nombre_cliente: document.getElementById("nombre").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    fecha_entrega: document.getElementById("fecha").value,
    tipo_producto: document.getElementById("producto").value,
    detalles_producto: document.getElementById("detalles").value.trim(),
    porciones: document.getElementById("porciones").value,
    metodo_entrega: document.getElementById("entrega").value,
    monto_total: document.getElementById("monto_estimado").value,
    estado_pago: "Pendiente (Web)"
  };

  // Formatear la fecha para que se lea más bonita en el mensaje de WhatsApp
  const fechaLegible = datosPedido.fecha_entrega.replace("T", " a las ");

  // Construir el mensaje para WhatsApp
  const mensajeWhatsApp = 
    `¡Hola Pastelería Las Esmeraldas! 🎂 Acabo de registrar mi pedido en la página web:\n\n` +
    `📌 *Orden:* ${datosPedido.id_pedido}\n` +
    `👤 *Cliente:* ${datosPedido.nombre_cliente}\n` +
    `📞 *Teléfono:* ${datosPedido.telefono}\n` +
    `🍰 *Producto:* ${datosPedido.tipo_producto} (${datosPedido.porciones} porc.)\n` +
    `📅 *Entrega:* ${fechaLegible}\n` +
    `🚚 *Modalidad:* ${datosPedido.metodo_entrega}\n` +
    `📝 *Detalles:* ${datosPedido.detalles_producto}\n\n` +
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
    
    // Limpiar el formulario
    document.getElementById("formularioPedido").reset();
    document.getElementById("monto_estimado").value = "Por definir";

    // Abrir WhatsApp con el mensaje listo
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