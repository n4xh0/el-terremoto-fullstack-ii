import { solicitar } from './api.js';
export function validarPerfil(p,direccion) { if (!p.nombre?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '') || !p.telefono?.trim()) throw new Error('Completa nombre, correo y teléfono.'); if (direccion && (!p.direccion?.trim() || !p.comuna?.trim())) throw new Error('Completa la dirección y comuna.'); }
export function obtenerPedidos() { return solicitar('pedidos'); }
export function crearPedido(lineas, cliente, entrega, metodo) { validarPerfil(cliente, entrega === 'despacho'); return solicitar('pedidos','POST',{lineas,cliente,entrega,metodo}); }
export function actualizarEstado(id, estado) { return solicitar('pedidos/'+id,'PATCH',{estado}); }
