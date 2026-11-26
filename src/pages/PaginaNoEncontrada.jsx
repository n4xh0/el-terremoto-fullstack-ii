import { Link } from 'react-router';
export function PaginaNoEncontrada() {
    return <section className="wrap text-center"><p className="display-1">404</p><h1>Esta página no está en la carta.</h1><Link className="btn btn-primary mt-4" to="/">Volver al inicio</Link></section>;
}
