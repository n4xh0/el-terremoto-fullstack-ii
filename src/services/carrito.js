export function precioFinal(producto) {
  return Math.round(producto.precio * (1 - (producto.descuento ?? 0) / 100));
}

export function reconciliarCarrito(lineas, productos) {
  if (!Array.isArray(lineas)) return [];
  const cantidades = new Map();
  for (const linea of lineas) {
    const producto = productos.find(p => p.id === linea.id && p.disponible);
    if (producto && Number.isSafeInteger(linea.cantidad) && linea.cantidad > 0) {
      cantidades.set(linea.id, Math.min(99, (cantidades.get(linea.id) ?? 0) + linea.cantidad));
    }
  }
  return [...cantidades].map(([id, cantidad]) => {
    const producto = productos.find(p => p.id === id);
    return { id, cantidad, producto, precio: precioFinal(producto) };
  });
}

export function cambiarCantidad(lineas, id, delta) {
  const actual = lineas.find(p => p.id === id);
  const cantidad = Math.min(99, (actual?.cantidad ?? 0) + delta);
  if (cantidad <= 0) return lineas.filter(p => p.id !== id);
  return actual ? lineas.map(p => p.id === id ? { id, cantidad } : p) : [...lineas, { id, cantidad }];
}

export function totalCarrito(items) {
  return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function clp(valor) {
  return '$' + new Intl.NumberFormat('es-CL').format(valor);
}
