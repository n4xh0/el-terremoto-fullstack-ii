import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ListaProductos } from '../components/ListaProductos';
import { FiltrosProductos } from '../components/FiltrosProductos';
export function PaginaCarta({ productos, onAgregar, ofertas = false, incrustada = false }) {
    const [params, setParams] = useSearchParams();
    const [busqueda, setBusqueda] = useState('');
    const categoria = params.get('categoria') ?? 'Todas';
    const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const lista = productos.filter(p => (categoria === 'Todas' || p.categoria === categoria) && (!ofertas || p.descuento > 0) && normalizar(p.nombre + ' ' + p.desc).includes(normalizar(busqueda)));
    const Titulo = incrustada ? 'h2' : 'h1';
    return <section id="carta"><div className="wrap"><Titulo>{ofertas ? 'Ofertas de la fonda' : 'La carta'}</Titulo><p className="text-muted mt-2">{ofertas ? 'Productos con descuento vigente. Los precios finales se aplican también en el carrito.' : 'Piqueos, tragos y algo frío para acompañar toda la tarde.'}</p><FiltrosProductos busqueda={busqueda} categoria={categoria} onBuscar={setBusqueda} onCategoria={valor => setParams(valor === 'Todas' ? {} : { categoria: valor })}/><ListaProductos productos={lista} onAgregar={onAgregar}/></div></section>;
}
