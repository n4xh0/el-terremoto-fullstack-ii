import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { obtenerPedidos, actualizarEstado } from '../services/pedidos';
import { clp } from '../services/carrito.js';
import { Aviso } from '../components/Aviso';
export function PaginaPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        obtenerPedidos().then(setPedidos).catch(e => setError(e.message));
    }, []);
    async function cambiar(id, estado) {
        try {
            await actualizarEstado(id, estado);
            setPedidos(await obtenerPedidos());
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo guardar.');
        }
    }
    return <section className="wrap"><Link to="/admin">← Volver al mantenedor</Link><h1 className="my-4">Pedidos de la fonda</h1><Aviso mensaje={error}/>{!pedidos.length && <p>Todavía no hay pedidos. Completa una compra de prueba para verla aquí.</p>}<div className="row g-4">{[...pedidos].reverse().map(p => <div className="col-12 col-lg-6" key={p.id}><article className="panel h-100"><h2 className="h4">Pedido {p.id.slice(0, 8)}</h2><p>{new Date(p.fecha).toLocaleString('es-CL')}</p><p>{p.cliente.nombre} · {p.cliente.email}<br />{p.cliente.telefono}</p><p>{p.entrega === 'retiro' ? 'Retiro en la fonda' : `${p.cliente.direccion}, ${p.cliente.comuna}`}</p><ul>{p.items.map(i => <li key={i.id}>{i.cantidad} × {i.nombre} · {clp(i.precio * i.cantidad)}</li>)}</ul><p><strong>Total: {clp(p.total)}</strong> · {p.metodo} simulado</p><label className="form-label" htmlFor={`estado-${p.id}`}>Estado</label><select id={`estado-${p.id}`} className="form-select" value={p.estado} onChange={e => cambiar(p.id, e.target.value)}>{['Recibido', 'Preparando', 'Entregado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}</select></article></div>)}</div></section>;
}
