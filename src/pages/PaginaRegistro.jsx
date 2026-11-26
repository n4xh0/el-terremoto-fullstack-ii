import { useState } from 'react';
import { useNavigate } from 'react-router';
import { solicitar } from '../services/api';
import { Aviso } from '../components/Aviso';
export function PaginaRegistro() {
 const [nombre,setNombre]=useState(''), [usuario,setUsuario]=useState(''), [password,setPassword]=useState(''), [error,setError]=useState(''); const navigate=useNavigate();
 async function registrar(e) { e.preventDefault(); try { await solicitar('auth/registro','POST',{nombre,usuario,password}); navigate('/login',{state:{alias:usuario}}); } catch(e) { setError(e.message); } }
 return <section className="wrap formulario-pagina"><h1>Crear cuenta</h1><form className="panel" onSubmit={registrar}><Aviso mensaje={error}/><label className="campo">Nombre<input required value={nombre} onChange={e=>setNombre(e.target.value)}/></label><label className="campo">Alias<input required value={usuario} onChange={e=>setUsuario(e.target.value)}/></label><label className="campo">Contraseña<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-primary">Crear cuenta</button></form></section>;
}
