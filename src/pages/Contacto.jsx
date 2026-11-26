import { useState } from 'react';
import { solicitar } from '../services/api';

export function Contacto() {
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState('');
  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    try {
      await solicitar('consultas', 'POST', { mensaje: texto.trim(), fecha: new Date().toISOString() });
      setTexto('');
      setAviso('Consulta de práctica guardada.');
    } catch (error) { setAviso(error.message); }
  }
  return <section className="wrap formulario-pagina"><h1>Contacto</h1>
    <p>Deja una consulta de práctica sobre la carta. Los mensajes se guardan en esta instalación.</p>
    <form className="panel" onSubmit={enviar}><label className="campo">Mensaje
      <textarea required maxLength={500} value={texto} onChange={e => setTexto(e.target.value)}/></label>
      <button className="btn btn-primary">Guardar consulta</button><p role="status">{aviso}</p>
    </form></section>;
}
