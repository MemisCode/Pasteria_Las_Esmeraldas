function pedirPorWhatsApp(nombreProducto) {
  // Reemplaza con tu número telefónico con el código de país (ejemplo: 506 para Costa Rica)
  const telefono = "50600000000"; 
  const mensaje = encodeURIComponent(`¡Hola! Quisiera consultar/pedir el producto: "${nombreProducto}" en Pastelería Las Esmeraldas.`);
  
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}