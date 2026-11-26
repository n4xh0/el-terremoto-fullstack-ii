import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { solicitar } from '../services/api';
import { Aviso } from '../components/Aviso';
export function PaginaDirectorio({ recurso }) {
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    solicitar(recurso).then(datos => { if (activo) setFilas(datos); })
      .catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [recurso]);
  return <section className="wrap"><Link to="/admin">Volver al panel</Link><h1>{recurso === 'usuarios' ? 'Usuarios de práctica' : 'Categorías de la carta'}</h1>
    <Aviso mensaje={error}/><ul className="panel">{filas.map(f => <li key={f.id}>{f.nombre}{f.rol && ' · ' + f.rol}</li>)}</ul></section>;
}
