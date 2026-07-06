import { Link, NavLink } from 'react-router-dom'
import { APP } from '../config'

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <img src="/logo.svg" alt="Api Vilu" width="28" height="28" />
          <span>{APP.name}</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/teste">Teste de envio</NavLink>
          <NavLink to="/privacidade">Privacidade</NavLink>
          <NavLink to="/termos">Termos</NavLink>
        </nav>
      </div>
    </header>
  )
}
