import { useState } from 'react';
import { FormularioCliente } from '../components/FormularioCliente';
import { Aviso } from '../components/Aviso';
import { actualizarPerfil } from '../services/sesion';
import { validarPerfil } from '../services/pedidos';
export function PaginaPerfil({ sesion, onActualizar }) {
    const [datos, setDatos] = useState({ nombre: sesion.nombre, email: sesion.email, telefono: sesion.telefono, direccion: sesion.direccion, comuna: sesion.comuna });
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    async function guardar(e) {
        e.preventDefault();
        setMensaje(null);
        try {
            validarPerfil(datos, true);
            onActualizar(await actualizarPerfil(datos));
            setError(null);
            setMensaje('Datos guardados. Se completarán automáticamente al comprar.');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo guardar.');
        }
    }
    return <section className="wrap formulario-pagina"><h1>Mis datos</h1><p className="my-3">Completa tus datos para agilizar el checkout.</p><form className="panel" onSubmit={guardar} noValidate><Aviso mensaje={error}/><Aviso mensaje={mensaje} tipo="success"/><FormularioCliente datos={datos} onCambiar={setDatos}/><button className="btn btn-primary">Guardar datos</button></form></section>;
}
