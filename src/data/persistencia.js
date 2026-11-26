export function leerJSON(storage, clave, respaldo) {
  const texto = storage.getItem(clave);
  if (texto === null) return respaldo;
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error('Hay datos guardados que no se pueden leer. No se han sobrescrito.');
  }
}

export function guardarJSON(storage, clave, valor) {
  try {
    storage.setItem(clave, JSON.stringify(valor));
  } catch {
    throw new Error('No se pudo guardar. Revisa el espacio del navegador o usa una imagen más pequeña.');
  }
}

export function validarProducto(datos) {
  if (!datos.nombre.trim() || datos.nombre.trim().length > 100) throw new Error('Escribe un nombre de 1 a 100 caracteres.');
  if (!['Piqueos', 'Tragos', 'Bebidas frías'].includes(datos.categoria)) throw new Error('Selecciona una categoría válida.');
  if (!Number.isSafeInteger(datos.precio) || datos.precio < 0) throw new Error('El precio debe ser un entero mayor o igual a cero.');
  if (!Number.isInteger(datos.descuento) || datos.descuento < 0 || datos.descuento > 90) throw new Error('El descuento debe ser un entero de 0 a 90.');
  if (datos.desc.length > 500) throw new Error('La descripción admite hasta 500 caracteres.');
  if (datos.foto && !/^(\/?img\/[^<>]+|data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+)$/.test(datos.foto)) throw new Error('Selecciona una imagen local válida.');
}

