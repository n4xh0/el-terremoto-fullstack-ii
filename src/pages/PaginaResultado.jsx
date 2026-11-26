import { Link, useLocation } from 'react-router';
import { clp } from '../services/carrito.js';
export function PaginaResultado({ exito, ultimoPedido }) {
    const location = useLocation();
    const pedido = location.state?.pedido ?? ultimoPedido;
    if (exito && !pedido)
        return <section className="wrap"><h1>No hay un pedido para mostrar</h1><Link className="btn btn-primary mt-3" to="/carta">Ver la carta</Link></section>;
    return <section className="wrap formulario-pagina"><div className="panel"><p className="hero-eyebrow">El Terremoto · Compra de demostración</p><h1>{exito ? '¡Pedido recibido!' : 'No se pudo realizar el pago'}</h1><p className="my-4">{exito ? 'Tu pedido de prueba quedó guardado. No se ha cobrado dinero.' : location.state?.motivo ?? 'Tu carrito se conserva. Puedes volver a intentarlo.'}</p>{exito && pedido && <><p><strong>Pedido:</strong> {pedido.id.slice(0, 8)}</p><p><strong>Cliente:</strong> {pedido.cliente.nombre}</p><p><strong>Entrega:</strong> {pedido.entrega === 'retiro' ? 'Retiro en la fonda' : `${pedido.cliente.direccion}, ${pedido.cliente.comuna}`}</p><p><strong>Pago:</strong> {pedido.metodo} (simulado)</p><ul className="list-unstyled">{pedido.items.map(i => <li className="d-flex justify-content-between border-bottom py-2" key={i.id}><span>{i.cantidad} × {i.nombre}</span><strong>{clp(i.precio * i.cantidad)}</strong></li>)}</ul><p>Entrega: {clp(pedido.envio)}</p><p className="h3 my-4">Total: {clp(pedido.total)}</p><button className="btn btn-ghost me-2" onClick={() => window.print()}>Imprimir resumen</button></>}<Link className="btn btn-primary" to={exito ? '/carta' : '/checkout'}>{exito ? 'Volver a la carta' : 'Reintentar compra'}</Link></div></section>;
}
