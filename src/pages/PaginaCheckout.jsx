import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { crearPedido, validarPerfil } from '../services/pedidos';
import { FormularioCliente } from '../components/FormularioCliente';
import { ResumenCarrito } from '../components/ResumenCarrito';
import { Aviso } from '../components/Aviso';
export function PaginaCheckout({ items, sesion, onCompletado }) {
    const [datos, setDatos] = useState({ nombre: sesion?.nombre ?? '', email: sesion?.email ?? '', telefono: sesion?.telefono ?? '', direccion: sesion?.direccion ?? '', comuna: sesion?.comuna ?? '' });
    const [entrega, setEntrega] = useState('retiro');
    const [metodo, setMetodo] = useState('transferencia');
    const [fallo, setFallo] = useState(false);
    const [acepta, setAcepta] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const bloqueo = useRef(false);
    const navigate = useNavigate();
    async function enviar(e) {
        e.preventDefault();
        if (bloqueo.current)
            return;
        try {
            validarPerfil(datos, entrega === 'despacho');
            if (!acepta)
                throw new Error('Confirma que revisaste los datos de tu pedido.');
            if (fallo) {
                navigate('/compra-fallida', { state: { motivo: 'El pago de prueba fue rechazado. Tu carrito sigue disponible.' } });
                return;
            }
            bloqueo.current = true;
            setEnviando(true);
            const pedido = await crearPedido(items.map(i => ({ id: i.id, cantidad: i.cantidad })), datos, entrega, metodo);
            onCompletado(pedido);
            navigate('/compra-exitosa', { state: { pedido }, replace: true });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo completar el pedido.');
        }
        finally {
            bloqueo.current = false;
            setEnviando(false);
        }
    }
    if (!items.length)
        return <section className="wrap"><h1>Tu carrito está vacío</h1><Link className="btn btn-primary mt-4" to="/carta">Volver a la carta</Link></section>;
    return <section className="wrap"><h1>Finalizar pedido</h1><p className="my-3">Compra de demostración: no se realizarán cobros ni despachos reales.</p><div className="row g-4"><div className="col-lg-7"><form className="panel" onSubmit={enviar} noValidate><Aviso mensaje={error}/><h2 className="h4 mb-3">Datos de contacto y entrega</h2><div className="campo"><label htmlFor="entrega">Tipo de entrega</label><select id="entrega" value={entrega} onChange={e => setEntrega(e.target.value)}><option value="retiro">Retiro en la fonda · Sin costo</option><option value="despacho">Despacho de prueba · $2.500</option></select></div><FormularioCliente datos={datos} onCambiar={setDatos} direccion={entrega === 'despacho'}/><div className="campo"><label htmlFor="metodo">Forma de pago</label><select id="metodo" value={metodo} onChange={e => setMetodo(e.target.value)}><option value="transferencia">Transferencia (simulada)</option><option value="efectivo">Efectivo al recibir (simulado)</option></select></div><div className="form-check mb-3"><input className="form-check-input" type="checkbox" id="acepta" checked={acepta} onChange={e => setAcepta(e.target.checked)}/><label className="form-check-label" htmlFor="acepta">Revisé los datos y el total de mi pedido.</label></div><details className="mb-4"><summary>Opciones de demostración</summary><div className="form-check my-2"><input className="form-check-input" type="checkbox" id="simular-fallo" checked={fallo} onChange={e => setFallo(e.target.checked)}/><label className="form-check-label" htmlFor="simular-fallo">Simular rechazo del pago</label></div></details><button className="btn btn-primary" disabled={enviando}>{enviando ? 'Procesando…' : 'Confirmar pedido de prueba'}</button></form></div><div className="col-lg-5"><ResumenCarrito items={items} envio={entrega === 'despacho' ? 2500 : 0}/></div></div></section>;
}
