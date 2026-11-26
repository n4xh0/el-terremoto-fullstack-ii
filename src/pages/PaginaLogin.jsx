import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ingresar } from '../services/sesion';
import { Aviso } from '../components/Aviso';
export function PaginaLogin({ onIngresar }) {
    const location = useLocation();
    const [usuario, setUsuario] = useState(location.state?.alias || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    async function enviar(e) {
        e.preventDefault();
        try {
            const sesion = await ingresar(usuario, password);
            onIngresar(sesion);
            const destino = location.state?.desde;
            navigate(typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//') ? destino : sesion.rol === 'admin' ? '/admin' : '/perfil', { replace: true });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo ingresar.');
            setPassword('');
        }
    }
    return <section className="wrap"><div className="login-panel"><h1>Iniciar sesión</h1><p>Acceso para administrar la carta o completar tus datos de compra.</p><Link to="/registro">Crear un perfil de práctica</Link><form onSubmit={enviar}><Aviso mensaje={error}/><div className="campo"><label htmlFor="login-user">Usuario</label><input id="login-user" autoComplete="username" value={usuario} onChange={e => setUsuario(e.target.value)}/></div><div className="campo"><label htmlFor="login-pass">Contraseña</label><input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}/></div><button className="btn btn-primary">Entrar</button><Link className="btn text-white" to="/">Volver al inicio</Link></form></div></section>;
}
