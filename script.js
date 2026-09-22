function pedirPorWhatsApp(nombreProducto) {
  // Ingresa tu número telefónico con el código de país (ejemplo: 506 para Costa Rica)
  const telefono = "50688888888"; 
  const mensaje = encodeURIComponent(`¡Hola! Quisiera consultar sobre el producto: ${nombreProducto} en Pastelería Las Esmeraldas.`);
  
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}