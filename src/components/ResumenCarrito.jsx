import { clp, totalCarrito } from '../services/carrito.js';
export function ResumenCarrito({ items, envio = 0 }) {
    return <aside className="panel resumen"><h2>Resumen del pedido</h2><ul className="list-unstyled my-4">{items.map(i => <li key={i.id} className="d-flex justify-content-between gap-3 border-bottom py-2"><span>{i.cantidad} × {i.producto.nombre}</span><strong>{clp(i.precio * i.cantidad)}</strong></li>)}</ul><p className="d-flex justify-content-between"><span>Subtotal</span><span>{clp(totalCarrito(items))}</span></p><p className="d-flex justify-content-between"><span>Entrega</span><span>{envio ? clp(envio) : 'Sin costo'}</span></p><div className="cart-total"><span>Total</span><strong>{clp(totalCarrito(items) + envio)}</strong></div></aside>;
}
