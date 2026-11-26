import { Link } from 'react-router';
import { clp, precioFinal } from '../services/carrito.js';
export function ProductoCard({ producto, onAgregar }) {
    return <article className={`menu-item ${producto.disponible ? '' : 'agotado'}`}>
    {producto.foto && <Link className="foto" to={`/producto/${producto.id}`}><img src={producto.foto.startsWith('img/') ? '/' + producto.foto : producto.foto} alt={producto.nombre} loading="lazy"/></Link>}
    <div className="fila-principal">
      <div className="info">
        <div className="fila-nombre"><h3><Link to={`/producto/${producto.id}`}>{producto.nombre}</Link></h3><span className="cat-tag">{producto.categoria}</span></div>
        <p>{producto.desc}</p>
        {!producto.disponible && <span className="agotado-tag">Agotado por hoy</span>}
        {producto.descuento > 0 && <span className="badge text-bg-danger">{producto.descuento}% de descuento</span>}
      </div>
      <div className="precio">
        {producto.descuento > 0 && <del className="precio-anterior">{clp(producto.precio)}</del>}
        <span>{clp(precioFinal(producto))}</span>
        <button className="btn btn-primary btn-small add-cart" disabled={!producto.disponible} onClick={() => onAgregar(producto.id)}>Agregar</button>
      </div>
    </div>
  </article>;
}
