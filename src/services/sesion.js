import { solicitar } from './api';
import { guardarJSON, leerJSON } from '../data/persistencia.js';
export function leerSesion() { const s = leerJSON(sessionStorage, 'terremoto_sesion_v2', null); return s && s.token && s.expira > Date.now() ? s : null; }
export async function ingresar(usuario, password) { const s = await solicitar('auth/login', 'POST', { usuario, password }); guardarJSON(sessionStorage, 'terremoto_sesion_v2', s); return s; }
export function cerrarSesion() { sessionStorage.removeItem('terremoto_sesion_v2'); }
export async function actualizarPerfil(perfil) { const actual = leerSesion(); if (!actual) throw new Error('Tu sesión venció.'); const actualizado = await solicitar('perfil', 'PATCH', perfil); const sesion = { ...actual, ...actualizado }; guardarJSON(sessionStorage, 'terremoto_sesion_v2', sesion); return sesion; }
export function exigirAdministrador() { if (leerSesion()?.rol !== 'admin') throw new Error('Inicia sesión como administrador.'); }
