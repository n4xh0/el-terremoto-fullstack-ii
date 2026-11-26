import { useState } from 'react';
import { Link, NavLink } from 'react-router';
export function Navbar({ cantidad, sesion, onSalir }) {
    const [abierto, setAbierto] = useState(false);
    return <header className="site">
    <nav className="navbar navbar-expand-lg container py-3" aria-label="Navegación principal">
      <Link className="brand text-decoration-none" to="/">El Terremoto <span className="tag">Fonda Dieciochera</span></Link>
      <button className="navbar-toggler" aria-label="Abrir menú" aria-expanded={abierto} aria-controls="menu-principal" onClick={() => setAbierto(!abierto)}><span className="navbar-toggler-icon"/></button>
      <div id="menu-principal" className={`collapse navbar-collapse ${abierto ? 'show' : ''}`}>
        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2" onClick={() => setAbierto(false)}>
          <NavLink className="nav-link" to="/carta">La carta</NavLink>
          <NavLink className="nav-link" to="/categorias">Categorías</NavLink>
          <NavLink className="nav-link" to="/ofertas">Ofertas</NavLink>
          <NavLink className="nav-link" to="/admin">Mantenedor</NavLink>
          <Link className="btn-cart text-decoration-none" to="/carrito">Carrito <span className="cart-count">{cantidad}</span></Link>
          {sesion ? <><Link className="nav-link" to="/perfil">{sesion.usuario}</Link><button className="btn btn-ghost btn-small" onClick={onSalir}>Salir</button></> : <NavLink className="nav-link" to="/login">Iniciar sesión</NavLink>}
        </div>
      </div>
    </nav>
  </header>;
}
