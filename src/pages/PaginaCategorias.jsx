import { Link } from 'react-router';
import { CATEGORIAS } from '../types/Producto';
export function PaginaCategorias({ productos }) {
    const fotos = ['anticuchos.jpg', 'terremoto-clasico.jpg', 'cerveza.jpg'];
    return <section className="wrap"><h1>Categorías</h1><p className="mt-2 mb-4">Encuentra algo para acompañar toda la tarde.</p><div className="row g-4">{CATEGORIAS.map((c, i) => <div className="col-12 col-md-4" key={c}><article className="card h-100 categoria-card"><img className="card-img-top" src={'/img/' + fotos[i]} alt={c}/><div className="card-body"><h2 className="h4">{c}</h2><p>{productos.filter(p => p.categoria === c).length} productos</p><Link className="btn btn-primary" to={`/carta?categoria=${encodeURIComponent(c)}`}>Ver {c.toLowerCase()}</Link></div></article></div>)}</div></section>;
}
