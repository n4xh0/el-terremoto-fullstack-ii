import { ProductoCard } from './ProductoCard';
export function ListaProductos({ productos, onAgregar }) {
    if (!productos.length)
        return <p className="menu-vacio" role="status">No hay productos que coincidan con la búsqueda.</p>;
    return <div className="menu-lista">{productos.map(p => <ProductoCard key={p.id} producto={p} onAgregar={onAgregar}/>)}</div>;
}
