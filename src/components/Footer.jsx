import { Link } from 'react-router-dom'
import { APP } from '../config'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>&copy; {year} {APP.name}. Uso pessoal.</span>
        <span className="footer-links">
          <Link to="/privacidade">Politica de Privacidade</Link>
          <Link to="/termos">Termos de Uso</Link>
          <a href={`mailto:${APP.contactEmail}`}>Contato</a>
        </span>
      </div>
    </footer>
  )
}
