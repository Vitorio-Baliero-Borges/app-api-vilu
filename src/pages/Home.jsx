import { useEffect, useState } from 'react'
import { APP } from '../config'
import { loadFacebookSdk, launchSignup, attachSignupListener } from '../lib/embeddedSignup'
import { getPhoneNumberDetails } from '../lib/cloudApi'

const STORE_KEY = 'apivilu_connection'

export default function Home() {
  const [status, setStatus] = useState('')
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState('')
  const [fetching, setFetching] = useState(false)
  const [conn, setConn] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null } catch { return null }
  })

  const save = (info) => { setConn(info); localStorage.setItem(STORE_KEY, JSON.stringify(info)) }

  useEffect(() => {
    loadFacebookSdk().then(() => setReady(true))
    const detach = attachSignupListener({
      onData: (data) => {
        const info = {
          waba_id: data.waba_id,
          phone_number_id: data.phone_number_id,
          // alguns fluxos ja retornam o numero; guardamos se vier
          phone_number: data.phone_number || data.display_phone_number || '',
          at: new Date().toISOString(),
        }
        save(info)
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

  const reset = () => { localStorage.removeItem(STORE_KEY); setConn(null); setStatus(''); setToken('') }

  const fetchNumber = async () => {
    if (!conn?.phone_number_id) { setStatus('Sem Phone Number ID para consultar.'); return }
    if (!token) { setStatus('Cole um token de acesso para buscar o numero.'); return }
    setFetching(true); setStatus('')
    try {
      const r = await getPhoneNumberDetails({ phoneNumberId: conn.phone_number_id, token })
      if (r.ok && r.json && r.json.display_phone_number) {
        save({ ...conn, phone_number: r.json.display_phone_number, verified_name: r.json.verified_name || '' })
        setStatus('Numero atualizado: ' + r.json.display_phone_number)
      } else {
        setStatus('Nao foi possivel buscar. Resposta: ' + JSON.stringify(r.json))
      }
    } catch (e) {
      setStatus('Erro ao buscar (possivel CORS): ' + e.message)
    } finally { setFetching(false) }
  }

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
            <label>Numero conectado</label>
            <input readOnly value={conn.phone_number ? (conn.phone_number + (conn.verified_name ? '  -  ' + conn.verified_name : '')) : 'Nao informado pelo cadastro - use "Buscar numero" abaixo'} />
            <div className="grid" style={{ marginTop: 12 }}>
              <div>
                <label>WABA ID</label>
                <input readOnly value={conn.waba_id || '-'} />
              </div>
              <div>
                <label>Phone Number ID</label>
                <input readOnly value={conn.phone_number_id || '-'} />
              </div>
            </div>
            <p className="hint">Conectado em {new Date(conn.at).toLocaleString('pt-BR')}. Anote esses dados no seu Obsidian (07 - Credenciais).</p>

            {!conn.phone_number && (
              <div className="card" style={{ background: '#fafafa' }}>
                <h2 style={{ fontSize: 15 }}>Buscar numero conectado</h2>
                <p className="desc">O cadastro nao devolveu o numero, so os IDs. Cole um token de acesso para o app buscar o numero na Graph API.</p>
                <label>Access Token</label>
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAxxxxxxxxxx" />
                <div style={{ marginTop: 12 }}>
                  <button className="btn" onClick={fetchNumber} disabled={fetching}>{fetching ? 'Buscando...' : 'Buscar numero'}</button>
                </div>
              </div>
            )}

            <button className="btn secondary" onClick={reset} style={{ marginTop: 12 }}>Limpar</button>
          </>
        ) : (
          <p className="desc">Assim que voce concluir a conexao, o numero, o WABA ID e o Phone Number ID aparecem aqui.</p>
        )}
      </section>
    </>
  )
}
