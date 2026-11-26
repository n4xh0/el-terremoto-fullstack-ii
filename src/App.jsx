import { Contacto } from './pages/Contacto';
import { PaginaRegistro } from './pages/PaginaRegistro';
import { PaginaDirectorio } from './pages/PaginaDirectorio';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { actualizarProducto, crearProducto, eliminarProducto, obtenerProductos } from './services/productos';
import { cerrarSesion, exigirAdministrador, leerSesion } from './services/sesion';
import { cambiarCantidad, reconciliarCarrito } from './services/carrito.js';
import { guardarJSON, leerJSON } from './data/persistencia.js';
import { Navbar } from './components/Navbar';
import { Aviso } from './components/Aviso';
import { RutaProtegida } from './components/RutaProtegida';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaCarta } from './pages/PaginaCarta';
import { PaginaCategorias } from './pages/PaginaCategorias';
import { PaginaDetalle } from './pages/PaginaDetalle';
import { PaginaCarrito } from './pages/PaginaCarrito';
import { PaginaLogin } from './pages/PaginaLogin';
import { PaginaPerfil } from './pages/PaginaPerfil';
import { PaginaCheckout } from './pages/PaginaCheckout';
import { PaginaResultado } from './pages/PaginaResultado';
import { PaginaAdmin } from './pages/PaginaAdmin';
import { PaginaFormulario } from './pages/PaginaFormulario';
import { PaginaPedidos } from './pages/PaginaPedidos';
import { PaginaNoEncontrada } from './pages/PaginaNoEncontrada';
export default function App() {
    const [productos, setProductos] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [sesion, setSesion] = useState(null);
    const [ultimoPedido, setUltimoPedido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const mensaje = (e) => e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
    useEffect(() => {
        async function cargar() {
            try {
                const datos = await obtenerProductos();
                setProductos(datos);
                setLineas(reconciliarCarrito(leerJSON(localStorage, 'carrito-terremoto', []), datos).map(i => ({ id: i.id, cantidad: i.cantidad })));
                setSesion(leerSesion());
                setUltimoPedido(leerJSON(sessionStorage, 'terremoto_ultimo_pedido', null));
            }
            catch (e) {
                setError(mensaje(e));
            }
            finally {
                setCargando(false);
            }
        }
        cargar();
        window.addEventListener('storage', cargar);
        const timer = window.setInterval(() => {
            try {
                setSesion(leerSesion());
            }
            catch (e) {
                setError(mensaje(e));
            }
        }, 1000);
        return () => { window.removeEventListener('storage', cargar); clearInterval(timer); };
    }, []);
    useEffect(() => { if (!location.hash)
        window.scrollTo(0, 0); }, [location.pathname, location.hash]);
    async function crear(datos) {
        try {
            exigirAdministrador();
            const creado = await crearProducto(datos);
            setProductos(prev => [...prev, creado]);
            setError(null);
            return true;
        }
        catch (e) {
            setError(mensaje(e));
            return false;
        }
    }
    async function actualizar(id, datos) {
        try {
            exigirAdministrador();
            const actualizado = await actualizarProducto(id, datos);
            setProductos(prev => prev.map(p => p.id === id ? actualizado : p));
            setError(null);
            return true;
        }
        catch (e) {
            setError(mensaje(e));
            return false;
        }
    }
    async function eliminar(id) {
        if (!confirm(`¿Eliminar "${productos.find(p => p.id === id)?.nombre}" de la carta?`))
            return;
        try {
            exigirAdministrador();
            await eliminarProducto(id);
            setProductos(prev => prev.filter(p => p.id !== id));
            setError(null);
        }
        catch (e) {
            setError(mensaje(e));
        }
    }
    const items = reconciliarCarrito(lineas, productos);
    function guardarCarrito(nuevas) {
        try {
            guardarJSON(localStorage, 'carrito-terremoto', nuevas);
            setLineas(nuevas);
            setError(null);
            return true;
        }
        catch (e) {
            setError(mensaje(e));
            return false;
        }
    }
    function cambiar(id, delta) {
        if (!productos.some(p => p.id === id && p.disponible))
            return false;
        return guardarCarrito(cambiarCantidad(items.map(i => ({ id: i.id, cantidad: i.cantidad })), id, delta));
    }
    function agregar(id) { if (cambiar(id, 1))
        navigate('/carrito'); }
    function salir() { try {
        cerrarSesion();
        setSesion(null);
        navigate('/');
    }
    catch (e) {
        setError(mensaje(e));
    } }
    function completar(pedido) {
        setUltimoPedido(pedido);
        setLineas([]);
        try {
            guardarJSON(sessionStorage, 'terremoto_ultimo_pedido', pedido);
            localStorage.removeItem('carrito-terremoto');
            setError(null);
        }
        catch {
            setError('El pedido quedó guardado, pero no se pudo limpiar el carrito del navegador. No repitas la compra.');
        }
    }
    const formulario = <PaginaFormulario productos={productos} onCrear={crear} onActualizar={actualizar}/>;
    return <><Navbar cantidad={items.reduce((n, i) => n + i.cantidad, 0)} sesion={sesion} onSalir={salir}/><main id="contenido"><div className="wrap pt-3"><Aviso mensaje={error}/></div>{cargando ? <p className="wrap" role="status">Cargando la carta…</p> : <Routes>
    <Route path="/" element={<PaginaInicio productos={productos} onAgregar={agregar}/>}/>
    <Route path="/carta" element={<PaginaCarta productos={productos} onAgregar={agregar}/>}/>
    <Route path="/categorias" element={<PaginaCategorias productos={productos}/>}/>
    <Route path="/ofertas" element={<PaginaCarta productos={productos} onAgregar={agregar} ofertas/>}/>
    <Route path="/producto/:id" element={<PaginaDetalle productos={productos} onAgregar={agregar}/>}/>
    <Route path="/carrito" element={<PaginaCarrito items={items} onCambiar={cambiar} onVaciar={() => guardarCarrito([])}/>}/>
    <Route path="/registro" element={<PaginaRegistro/>}/>
    <Route path="/nosotros" element={<section className="wrap panel"><h1>Nosotros</h1><p>El Terremoto es nuestra fonda dieciochera de práctica. En la carta reunimos tragos, piqueos y bebidas frías para armar un pedido de Fiestas Patrias.</p></section>}/>
    <Route path="/contacto" element={<Contacto/>}/>
    <Route path="/admin/usuarios" element={<RutaProtegida sesion={sesion} admin><PaginaDirectorio recurso="usuarios"/></RutaProtegida>}/>
    <Route path="/admin/categorias" element={<RutaProtegida sesion={sesion} admin><PaginaDirectorio recurso="categorias"/></RutaProtegida>}/>
    <Route path="/login" element={<PaginaLogin onIngresar={setSesion}/>}/>
    <Route path="/perfil" element={<RutaProtegida sesion={sesion}>{sesion && <PaginaPerfil key={sesion.usuario} sesion={sesion} onActualizar={setSesion}/>}</RutaProtegida>}/>
    <Route path="/checkout" element={<PaginaCheckout items={items} sesion={sesion} onCompletado={completar}/>}/>
    <Route path="/compra-exitosa" element={<PaginaResultado exito ultimoPedido={ultimoPedido}/>}/>
    <Route path="/compra-fallida" element={<PaginaResultado exito={false} ultimoPedido={null}/>}/>
    <Route path="/admin" element={<RutaProtegida sesion={sesion} admin><PaginaAdmin productos={productos} onEliminar={eliminar}/></RutaProtegida>}/>
    <Route path="/admin/nuevo" element={<RutaProtegida sesion={sesion} admin>{formulario}</RutaProtegida>}/>
    <Route path="/admin/editar/:id" element={<RutaProtegida sesion={sesion} admin>{formulario}</RutaProtegida>}/>
    <Route path="/admin/pedidos" element={<RutaProtegida sesion={sesion} admin><PaginaPedidos /></RutaProtegida>}/>
    <Route path="/index.html" element={<Navigate to="/" replace/>}/>
    <Route path="/productos.html" element={<Navigate to="/admin" replace/>}/>
    <Route path="/login.html" element={<Navigate to="/login" replace/>}/>
    <Route path="*" element={<PaginaNoEncontrada />}/>
  </Routes>}</main><footer><div className="wrap footer-inner"><div className="brand">El Terremoto</div><div className="meta"><a href="/nosotros">Nosotros</a> · <a href="/contacto">Contacto</a><br />Bebe con moderación.</div></div></footer></>;
}

