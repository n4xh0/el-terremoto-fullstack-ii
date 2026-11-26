export function FormularioCliente({ datos, onCambiar, direccion = true }) {
    const campos = [
        { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', auto: 'name' },
        { clave: 'email', etiqueta: 'Correo electrónico', tipo: 'email', auto: 'email' },
        { clave: 'telefono', etiqueta: 'Celular', tipo: 'tel', auto: 'tel' },
        ...(direccion ? [{ clave: 'direccion', etiqueta: 'Dirección y número', tipo: 'text', auto: 'street-address' }, { clave: 'comuna', etiqueta: 'Comuna', tipo: 'text', auto: 'address-level2' }] : [])
    ];
    return <div className="row">{campos.map(c => <div className="col-12 campo" key={c.clave}><label htmlFor={`cliente-${c.clave}`}>{c.etiqueta}</label><input id={`cliente-${c.clave}`} type={c.tipo} autoComplete={c.auto} maxLength={150} value={datos[c.clave]} onChange={e => onCambiar({ ...datos, [c.clave]: e.target.value })} required/></div>)}</div>;
}
