import { solicitar } from './api.js';
import { validarProducto } from '../data/persistencia.js';

export function obtenerProductos() {
  return solicitar('productos');
}
export function crearProducto(datos) {
  validarProducto(datos);
  return solicitar('productos', 'POST', datos);
}
export function actualizarProducto(id, datos) {
  validarProducto(datos);
  return solicitar('productos/' + id, 'PUT', datos);
}
export function eliminarProducto(id) {
  return solicitar('productos/' + id, 'DELETE');
}
