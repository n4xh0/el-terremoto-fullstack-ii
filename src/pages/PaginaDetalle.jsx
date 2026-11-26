import { Link, useParams } from 'react-router';
import { clp, precioFinal } from '../services/carrito.js';
import { PaginaNoEncontrada } from './PaginaNoEncontrada';
export function PaginaDetalle({ productos, onAgregar }) {
    const { id } = useParams();
    const p = productos.find(p => p.id === Number(id));
    if (!p)
        return <PaginaNoEncontrada />;
    return <section className="wrap"><Link to="/carta">← Volver a la carta</Link><div className="row g-5 align-items-center mt-2"><div className="col-md-6">{p.foto && <img className="detalle-foto" src={p.foto.startsWith('img/') ? '/' + p.foto : p.foto} alt={p.nombre}/>}</div><div className="col-md-6"><p className="cat-tag">{p.categoria}</p><h1>{p.nombre}</h1><p className="my-4">{p.desc}</p>{p.descuento > 0 && <p><del>{clp(p.precio)}</del> · {p.descuento}% de descuento</p>}<p className="h2 mb-4">{clp(precioFinal(p))}</p><button className="btn btn-primary" disabled={!p.disponible} onClick={() => onAgregar(p.id)}>{p.disponible ? 'Agregar al carrito' : 'Agotado por hoy'}</button></div></div></section>;
}
