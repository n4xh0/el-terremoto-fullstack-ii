import { useNavigate, useParams } from 'react-router';
import { FormularioProducto } from '../components/FormularioProducto';
import { PaginaNoEncontrada } from './PaginaNoEncontrada';
export function PaginaFormulario({ productos, onCrear, onActualizar }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const producto = id ? productos.find(p => p.id === Number(id)) ?? null : null;
    if (id && !producto)
        return <PaginaNoEncontrada />;
    async function guardar(datos) {
        const ok = producto ? await onActualizar(producto.id, datos) : await onCrear(datos);
        if (ok)
            navigate('/admin');
        return ok;
    }
    return <section className="wrap formulario-pagina"><h1>{producto ? 'Editar producto' : 'Agregar producto'}</h1><p className="my-3">Estos datos se muestran tal cual en la carta pública.</p><FormularioProducto key={id ?? 'nuevo'} productoInicial={producto} onGuardar={guardar} onCancelar={() => navigate('/admin')}/></section>;
}
