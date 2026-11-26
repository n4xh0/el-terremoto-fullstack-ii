import { useState } from 'react';
import { CATEGORIAS } from '../types/Producto';
import { validarProducto } from '../data/persistencia.js';
import { Aviso } from './Aviso';
export function FormularioProducto({ productoInicial, onGuardar, onCancelar }) {
    const [nombre, setNombre] = useState(productoInicial?.nombre ?? '');
    const [categoria, setCategoria] = useState(productoInicial?.categoria ?? 'Piqueos');
    const [precio, setPrecio] = useState(productoInicial ? String(productoInicial.precio) : '');
    const [desc, setDesc] = useState(productoInicial?.desc ?? '');
    const [foto, setFoto] = useState(productoInicial?.foto ?? '');
    const [disponible, setDisponible] = useState(productoInicial?.disponible ?? true);
    const [descuento, setDescuento] = useState(String(productoInicial?.descuento ?? 0));
    const [aviso, setAviso] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [leyendo, setLeyendo] = useState(false);
    function cargarFoto(e) {
        const archivo = e.target.files?.[0];
        if (!archivo)
            return;
        if (!/^image\/(jpeg|png|webp|gif)$/.test(archivo.type) || archivo.size > 750000) {
            setAviso('Selecciona una imagen JPG, PNG, WebP o GIF de hasta 750 KB.');
            e.target.value = '';
            return;
        }
        setLeyendo(true);
        const lector = new FileReader();
        lector.onload = () => { setFoto(String(lector.result)); setAviso(null); setLeyendo(false); };
        lector.onerror = () => { setAviso('No se pudo leer la imagen.'); setLeyendo(false); };
        lector.readAsDataURL(archivo);
    }
    async function manejarSubmit(e) {
        e.preventDefault();
        if (guardando || leyendo)
            return;
        const datos = { nombre: nombre.trim(), categoria, precio: Number(precio), desc: desc.trim(), foto, disponible, descuento: Number(descuento) };
        try {
            if (!precio.trim() || !descuento.trim())
                throw new Error('Completa el precio y el descuento.');
            validarProducto(datos);
            setAviso(null);
            setGuardando(true);
            const ok = await onGuardar(datos);
            if (!ok)
                setAviso('No se guardaron los cambios. Revisa el mensaje de error e inténtalo nuevamente.');
        }
        catch (error) {
            setAviso(error instanceof Error ? error.message : 'No se pudo guardar.');
        }
        finally {
            setGuardando(false);
        }
    }
    return <form className="panel" onSubmit={manejarSubmit} noValidate>
    <Aviso mensaje={aviso}/>
    <div className="campo"><label htmlFor="producto-nombre">Nombre</label><input id="producto-nombre" value={nombre} maxLength={100} onChange={e => setNombre(e.target.value)}/></div>
    <div className="campo"><label htmlFor="producto-foto">Foto (hasta 750 KB)</label><input type="file" id="producto-foto" accept="image/jpeg,image/png,image/webp,image/gif" onChange={cargarFoto} disabled={leyendo || guardando}/>{foto && <img className="foto-preview mt-2" src={foto.startsWith('img/') ? '/' + foto : foto} alt="Vista previa del producto"/>}{leyendo && <p role="status">Leyendo imagen…</p>}</div>
    <div className="row"><div className="col-md-6 campo"><label htmlFor="producto-categoria">Categoría</label><select id="producto-categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}</select></div><div className="col-md-6 campo"><label htmlFor="producto-precio">Precio (CLP)</label><input id="producto-precio" type="number" min="0" step="1" value={precio} onChange={e => setPrecio(e.target.value)}/></div></div>
    <div className="campo"><label htmlFor="producto-desc">Descripción</label><textarea id="producto-desc" maxLength={500} value={desc} onChange={e => setDesc(e.target.value)}/></div>
    <div className="campo"><label htmlFor="producto-descuento">Descuento (%)</label><input id="producto-descuento" type="number" min="0" max="90" step="1" value={descuento} onChange={e => setDescuento(e.target.value)}/></div>
    <div className="form-check mb-4"><input className="form-check-input" type="checkbox" id="producto-disponible" checked={disponible} onChange={e => setDisponible(e.target.checked)}/><label className="form-check-label" htmlFor="producto-disponible">Disponible en la carta</label></div>
    <div className="d-flex gap-2"><button className="btn btn-primary" disabled={guardando || leyendo}>{guardando ? 'Guardando…' : 'Guardar'}</button><button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={guardando}>Cancelar</button></div>
  </form>;
}
