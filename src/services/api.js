const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function solicitar(ruta, metodo = 'GET', datos) {
  const opciones = { method: metodo, headers: {} };
  const sesion = JSON.parse(sessionStorage.getItem('terremoto_sesion_v2') || 'null');
  if (sesion?.token) opciones.headers.Authorization = `Bearer ${sesion.token}`;
  if (datos !== undefined) { opciones.headers['Content-Type'] = 'application/json'; opciones.body = JSON.stringify(datos); }
  let respuesta;
  try { respuesta = await fetch(`${base}/${ruta}`, opciones); } catch { throw new Error('No se pudo conectar con la API.'); }
  if (!respuesta.ok) { const e = await respuesta.json().catch(() => ({})); throw new Error(e.error || `Error de la API (${respuesta.status}).`); }
  if (respuesta.status !== 204) return respuesta.json();
}
