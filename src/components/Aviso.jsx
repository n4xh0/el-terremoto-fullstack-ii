export function Aviso({ mensaje, tipo = 'danger' }) {
    return mensaje ? <div className={`alert alert-${tipo}`} role={tipo === 'danger' ? 'alert' : 'status'}>{mensaje}</div> : null;
}
