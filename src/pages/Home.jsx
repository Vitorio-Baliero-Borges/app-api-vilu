import { useEffect, useState } from 'react'
import { APP } from '../config'
import { loadFacebookSdk, launchSignup, attachSignupListener } from '../lib/embeddedSignup'

const STORE_KEY = 'apivilu_connection'

export default function Home() {
  const [status, setStatus] = useState('')
  const [ready, setReady] = useState(false)
  const [conn, setConn] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null } catch { return null }
  })

  useEffect(() => {
    loadFacebookSdk().then(() => setReady(true))
    const detach = attachSignupListener({
      onData: (data) => {
        const info = { waba_id: data.waba_id, phone_number_id: data.phone_number_id, at: new Date().toISOString() }
        setConn(info)
        localStorage.setItem(STORE_KEY, JSON.stringify(info))
        setStatus('Numero conectado com sucesso!')
      },
      onStatus: setStatus,
    })
    return detach
  }, [])

  const configured = !APP.appId.startsWith('SEU_') && !APP.configurationId.startsWith('SEU_')

  const handleConnect = () => {
    launchSignup({ onStatus: setStatus, onCode: (code) => console.log('code:', code) })
  }

  const reset = () => { localStorage.removeItem(STORE_KEY); setConn(null); setStatus('') }

  return (
    <>
      <section className="hero">
        <h1>{APP.name}</h1>
        <p>{APP.tagline}. Mantenha o app do celular funcionando e ganhe a API oficial no mesmo numero (coexistencia).</p>
      </section>

      <section className="card">
        <h2>Conectar meu numero</h2>
        <p className="desc">
          Abre o cadastro oficial da Meta (Embedded Signup) em modo coexistencia. Voce vai escolher a conta
          comercial, informar o numero e escanear o QR Code no WhatsApp Business App
          (Configuracoes &gt; Conta &gt; Plataforma comercial).
        </p>
        <button className="btn" onClick={handleConnect} disabled={!ready}>
          {ready ? 'Conectar meu numero (coexistencia)' : 'Carregando SDK...'}
        </button>
        {!configured && (
          <div className="status err">
            Falta configurar: defina VITE_APP_ID e VITE_CONFIGURATION_ID (arquivo .env ou variaveis na Vercel).
          </div>
        )}
        {status && <div className="status">{status}</div>}
      </section>

      <section className="card">
        <h2>Status da conexao {conn ? <span className="badge green">Conectado</span> : <span className="badge">Nao conectado</span>}</h2>
        {conn ? (
          <>
            <div className="grid">
              <div>
                <label>WABA ID</label>
                <input readOnly value={conn.waba_id || '-'} />
              </div>
              <div>
                <label>Phone Number ID</label>
                <input readOnly value={conn.phone_number_id || '-'} />
              </div>
            </div>
            <p className="hint">Conectado em {new Date(conn.at).toLocaleString('pt-BR')}. Anote esses IDs no seu Obsidian (07 - Credenciais).</p>
            <button className="btn secondary" onClick={reset} style={{ marginTop: 12 }}>Limpar</button>
          </>
        ) : (
          <p className="desc">Assim que voce concluir a conexao, o WABA ID e o Phone Number ID aparecem aqui.</p>
        )}
      </section>
    </>
  )
}
