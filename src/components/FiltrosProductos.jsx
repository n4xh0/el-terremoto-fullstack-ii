import { CATEGORIAS } from '../types/Producto';
export function FiltrosProductos({ busqueda, categoria, onBuscar, onCategoria }) {
    return <div className="row g-3 my-3">
    <div className="col-12 col-md-7"><label className="form-label" htmlFor="buscar">Buscar en la carta</label><input className="form-control" type="search" id="buscar" value={busqueda} onChange={e => onBuscar(e.target.value)} placeholder="Nombre o descripción"/></div>
    <div className="col-12 col-md-5"><label className="form-label" htmlFor="categoria">Categoría</label><select className="form-select" id="categoria" value={categoria} onChange={e => onCategoria(e.target.value)}>{['Todas', ...CATEGORIAS].map(c => <option key={c}>{c}</option>)}</select></div>
  </div>;
}
