import { useEffect, useState } from 'react'
import { APP } from '../config'
import { loadFacebookSdk, launchSignup, attachSignupListener } from '../lib/embeddedSignup'
import { getPhoneNumberDetails, deregisterNumber } from '../lib/cloudApi'

const STORE_KEY = 'apivilu_connection'

function WhatsAppLogo({ size = 40 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path fill="#fff" d="M16 6.5c-5.2 0-9.5 4.2-9.5 9.5 0 1.7.5 3.3 1.3 4.7L6.5 25.5l4.9-1.3c1.4.8 2.9 1.2 4.6 1.2h.01c5.2 0 9.49-4.2 9.49-9.5S21.2 6.5 16 6.5zm0 17.2h-.01c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3c-.8-1.3-1.2-2.7-1.2-4.2 0-4.3 3.5-7.9 7.9-7.9 2.1 0 4.1.8 5.6 2.3 1.5 1.5 2.3 3.5 2.3 5.6 0 4.4-3.6 7.8-7.9 7.8zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.2-.5 0-.1 0-.3-.1-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.4.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.2-.2-.2-.4-.3z" />
    </svg>
  )
}

export default function Home() {
  const [status, setStatus] = useState('')
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState('')
  const [conn, setConn] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null } catch { return null }
  })

  const save = (info) => { setConn(info); localStorage.setItem(STORE_KEY, JSON.stringify(info)) }

  useEffect(() => {
    loadFacebookSdk().then(() => setReady(true))
    const detach = attachSignupListener({
      onData: (data) => {
        save({
          waba_id: data.waba_id,
          phone_number_id: data.phone_number_id,
          phone_number: data.phone_number || data.display_phone_number || '',
          at: new Date().toISOString(),
        })
        setStatus('Numero conectado com sucesso!')
      },
      onStatus: setStatus,
    })
    return detach
  }, [])

  const configured = !APP.appId.startsWith('SEU_') && !APP.configurationId.startsWith('SEU_')
  const handleConnect = () => launchSignup({ onStatus: setStatus, onCode: (c) => console.log('code:', c) })
  const clearLocal = () => { localStorage.removeItem(STORE_KEY); setConn(null); setStatus(''); setToken('') }

  const fetchNumber = async () => {
    if (!conn?.phone_number_id) return setStatus('Sem Phone Number ID.')
    if (!token) return setStatus('Cole um token para buscar o numero.')
    setBusy('fetch'); setStatus('')
    try {
      const r = await getPhoneNumberDetails({ phoneNumberId: conn.phone_number_id, token })
      if (r.ok && r.json?.display_phone_number) {
        save({ ...conn, phone_number: r.json.display_phone_number, verified_name: r.json.verified_name || '' })
        setStatus('Numero atualizado: ' + r.json.display_phone_number)
      } else setStatus('Nao foi possivel buscar. Resposta: ' + JSON.stringify(r.json))
    } catch (e) { setStatus('Erro (possivel CORS): ' + e.message) } finally { setBusy('') }
  }

  const disconnect = async () => {
    if (!conn?.phone_number_id) return setStatus('Sem Phone Number ID.')
    if (!token) return setStatus('Cole um token para desconectar (whatsapp_business_management).')
    if (!window.confirm('Desconectar o numero da Cloud API (deregister)? Ele deixa de ser usado na API.')) return
    setBusy('disc'); setStatus('')
    try {
      const r = await deregisterNumber({ phoneNumberId: conn.phone_number_id, token })
      if (r.ok) { setStatus('Numero desconectado (deregister) com sucesso.'); clearLocal() }
      else setStatus('Falha ao desconectar. Resposta: ' + JSON.stringify(r.json))
    } catch (e) { setStatus('Erro (possivel CORS): ' + e.message) } finally { setBusy('') }
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

        <div className="status" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
          <strong>Importante:</strong> so e possivel usar a API oficial com um <strong>Portfolio Empresarial (BM) VERIFICADO e em conformidade</strong>. BMs nao verificadas, bloqueadas ou fora da politica comercial nao concluem a conexao (ou ficam com limites).
        </div>

        <button className="btn" onClick={handleConnect} disabled={!ready} style={{ marginTop: 4 }}>
          {ready ? 'Conectar meu numero (coexistencia)' : 'Carregando SDK...'}
        </button>
        {!configured && (
          <div className="status err">Falta configurar: defina VITE_APP_ID e VITE_CONFIGURATION_ID.</div>
        )}
        {status && <div className="status">{status}</div>}
      </section>

      <section className="card">
        <h2>Status da conexao {conn ? <span className="badge green">Conectado</span> : <span className="badge">Nao conectado</span>}</h2>
        {conn ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', border: '1px solid var(--border)', borderRadius: 10, background: '#f0fdf4' }}>
              <WhatsAppLogo size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>WhatsApp Business</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conn.phone_number ? (conn.phone_number + (conn.verified_name ? ' - ' + conn.verified_name : '')) : 'Numero: use "Buscar numero" abaixo'}
                </div>
              </div>
              <span className="badge green">Ativo</span>
            </div>

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
            <p className="hint">Conectado em {new Date(conn.at).toLocaleString('pt-BR')}.</p>

            <div className="card" style={{ background: '#fafafa' }}>
              <h2 style={{ fontSize: 15 }}>Acoes (precisam de um token de acesso)</h2>
              <p className="desc">Token com permissao whatsapp_business_management. Fica so no seu navegador.</p>
              <label>Access Token</label>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAxxxxxxxxxx" />
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn secondary" onClick={fetchNumber} disabled={busy === 'fetch'}>
                  {busy === 'fetch' ? 'Buscando...' : 'Buscar numero'}
                </button>
                <button className="btn" style={{ background: '#b42318' }} onClick={disconnect} disabled={busy === 'disc'}>
                  {busy === 'disc' ? 'Desconectando...' : 'Desconectar numero (deregister)'}
                </button>
              </div>
            </div>

            <button className="btn secondary" onClick={clearLocal} style={{ marginTop: 12 }}>Limpar (so a tela)</button>
          </>
        ) : (
          <p className="desc">Assim que voce concluir a conexao, o numero, o WABA ID e o Phone Number ID aparecem aqui.</p>
        )}
      </section>
    </>
  )
}
