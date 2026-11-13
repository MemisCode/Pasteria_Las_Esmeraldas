// 1. Pega aquí la URL de tu Google Apps Script que probamos en la Fase 2
const URL_API = "https://script.google.com/macros/s/AKfycbzCW4Q21vZ22_GN2fYLkjn48G3mqfvcg94lD3nAPmuqHTV06tZnW9b2n6P-wYzRyJE/exec";

// Función que se activa al tocar un producto del catálogo
function seleccionarProducto(nombreProducto, precioBase) {
  const selectProducto = document.getElementById("producto");
  const inputMonto = document.getElementById("monto_estimado");

  // Selecciona el producto en el desplegable
  selectProducto.value = nombreProducto;
  inputMonto.value = precioBase;

  // Desplaza suavemente la pantalla hacia el formulario
  document.getElementById("pedidos").scrollIntoView({ behavior: "smooth" });
}

// Envío del formulario a Google Sheets
document.getElementById("formularioPedido").addEventListener("submit", function(e) {
  e.preventDefault();

  const btn = document.getElementById("btnEnviar");
  btn.innerText = "Registrando pedido...";
  btn.disabled = true;

  const idPedido = "P-" + Math.floor(1000 + Math.random() * 9000);

  const datosPedido = {
    tipo: "pedido",
    id_pedido: idPedido,
    nombre_cliente: document.getElementById("nombre").value,
    telefono: document.getElementById("telefono").value,
    fecha_entrega: document.getElementById("fecha").value,
    tipo_producto: document.getElementById("producto").value,
    detalles_producto: document.getElementById("detalles").value,
    porciones: document.getElementById("porciones").value,
    metodo_entrega: document.getElementById("entrega").value,
    monto_total: document.getElementById("monto_estimado").value,
    estado_pago: "Pendiente"
  };

  fetch(URL_API, {
    method: "POST",
    body: JSON.stringify(datosPedido)
  })
  .then(res => res.json())
  .then(respuesta => {
    alert(`¡Gracias ${datosPedido.nombre_cliente}! Tu pedido (${idPedido}) fue recibido con éxito.`);
    document.getElementById("formularioPedido").reset();
    btn.innerText = "Registrar Pedido";
    btn.disabled = false;
  })
  .catch(error => {
    alert("Hubo un inconveniente al enviar el pedido. Por favor intenta de nuevo.");
    console.error(error);
    btn.innerText = "Registrar Pedido";
    btn.disabled = false;
  });
});