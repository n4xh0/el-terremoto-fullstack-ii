import { Navigate, useLocation } from 'react-router';
export function RutaProtegida({ sesion, admin = false, children }) {
    const location = useLocation();
    if (!sesion || sesion.expira <= Date.now())
        return <Navigate to="/login" state={{ desde: location.pathname }} replace/>;
    if (admin && sesion.rol !== 'admin')
        return <section className="wrap"><h1>Acceso de administrador</h1><p>Tu sesión de cliente no puede administrar productos. Cierra sesión e ingresa con la cuenta de administrador.</p></section>;
    return children;
}
