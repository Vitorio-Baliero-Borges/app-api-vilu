import { useEffect, useState } from 'react'
import { APP } from '../config'
import { loadFacebookSdk, launchSignup, attachSignupListener } from '../lib/embeddedSignup'
import { getWabaPhoneNumbers, deregisterNumber } from '../lib/cloudApi'

const STORE_KEY = 'apivilu_connections'
const OLD_KEY = 'apivilu_connection'

function loadConns() {
  try { const a = JSON.parse(localStorage.getItem(STORE_KEY)); if (Array.isArray(a)) return a } catch {}
  try { const o = JSON.parse(localStorage.getItem(OLD_KEY)); if (o) return [o] } catch {}
  return []
}

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
  const [conns, setConns] = useState(loadConns)

  const persist = (arr) => { setConns(arr); localStorage.setItem(STORE_KEY, JSON.stringify(arr)) }

  const addConn = (info) => {
    setConns((prev) => {
      const others = prev.filter((c) => c.phone_number_id !== info.phone_number_id)
      const next = [{ ...info }, ...others]
      localStorage.setItem(STORE_KEY, JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    loadFacebookSdk().then(() => setReady(true))
    const detach = attachSignupListener({
      onData: (data) => {
        addConn({
          waba_id: data.waba_id,
          phone_number_id: data.phone_number_id,
          phone_number: data.phone_number || data.display_phone_number || '',
          verified_name: '',
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

  // Busca os numeros reais de todas as WABAs conectadas e preenche a lista.
  const refreshNumbers = async () => {
    if (!conns.length) return setStatus('Nenhuma conexao na lista.')
    if (!token) return setStatus('Cole um token para buscar os numeros.')
    setBusy('refresh'); setStatus('')
    try {
      const wabas = [...new Set(conns.map((c) => c.waba_id).filter(Boolean))]
      const map = {}
      for (const wabaId of wabas) {
        const r = await getWabaPhoneNumbers({ wabaId, token })
        if (r.ok && Array.isArray(r.json?.data)) {
          for (const p of r.json.data) map[p.id] = { phone_number: p.display_phone_number, verified_name: p.verified_name || '' }
        }
      }
      const next = conns.map((c) => (map[c.phone_number_id] ? { ...c, ...map[c.phone_number_id] } : c))
      persist(next)
      setStatus('Numeros atualizados.')
    } catch (e) { setStatus('Erro (possivel CORS): ' + e.message) } finally { setBusy('') }
  }

  const disconnectItem = async (item) => {
    if (!token) return setStatus('Cole um token para desconectar (whatsapp_business_management).')
    if (!window.confirm('Desconectar ' + (item.phone_number || item.phone_number_id) + ' da Cloud API (deregister)?')) return
    setBusy('disc-' + item.phone_number_id); setStatus('')
    try {
      const r = await deregisterNumber({ phoneNumberId: item.phone_number_id, token })
      if (r.ok) { persist(conns.filter((c) => c.phone_number_id !== item.phone_number_id)); setStatus('Numero desconectado (deregister).') }
      else setStatus('Falha ao desconectar. Resposta: ' + JSON.stringify(r.json))
    } catch (e) { setStatus('Erro (possivel CORS): ' + e.message) } finally { setBusy('') }
  }

  const removeItem = (item) => persist(conns.filter((c) => c.phone_number_id !== item.phone_number_id))
  const clearAll = () => { localStorage.removeItem(STORE_KEY); localStorage.removeItem(OLD_KEY); persist([]); setToken('') }

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
          <strong>Importante:</strong> so e possivel usar a API oficial com um <strong>Portfolio Empresarial (BM) VERIFICADO e em conformidade</strong>. BMs nao verificadas, bloqueadas ou fora da politica comercial nao concluem a conexao.
        </div>
        <button className="btn" onClick={handleConnect} disabled={!ready} style={{ marginTop: 4 }}>
          {ready ? 'Conectar meu numero (coexistencia)' : 'Carregando SDK...'}
        </button>
        {!configured && <div className="status err">Falta configurar: defina VITE_APP_ID e VITE_CONFIGURATION_ID.</div>}
        {status && <div className="status">{status}</div>}
      </section>

      <section className="card">
        <h2>Numeros conectados <span className="badge green">{conns.length}</span></h2>

        {conns.length === 0 && (
          <p className="desc">Assim que voce concluir a conexao, os numeros aparecem aqui (cada conexao vira um item na lista).</p>
        )}

        {conns.map((c) => (
          <div key={c.phone_number_id} style={{ border: '1px solid var(--border)', borderRadius: 10, background: '#f0fdf4', padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <WhatsAppLogo size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{c.phone_number || 'Numero: clique em "Buscar numeros"'}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{c.verified_name || 'WhatsApp Business'}</div>
              </div>
              <span className="badge green">Ativo</span>
            </div>
            <div className="grid" style={{ marginTop: 12 }}>
              <div>
                <label>WABA ID</label>
                <input readOnly value={c.waba_id || '-'} />
              </div>
              <div>
                <label>Phone Number ID</label>
                <input readOnly value={c.phone_number_id || '-'} />
              </div>
            </div>
            <p className="hint">Conectado em {new Date(c.at).toLocaleString('pt-BR')}.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" style={{ background: '#b42318', padding: '8px 14px', fontSize: 13 }} onClick={() => disconnectItem(c)} disabled={busy === 'disc-' + c.phone_number_id}>
                {busy === 'disc-' + c.phone_number_id ? 'Desconectando...' : 'Desconectar (deregister)'}
              </button>
              <button className="btn secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => removeItem(c)}>Remover da lista</button>
            </div>
          </div>
        ))}

        {conns.length > 0 && (
          <div className="card" style={{ background: '#fafafa' }}>
            <h2 style={{ fontSize: 15 }}>Acoes (precisam de um token de acesso)</h2>
            <p className="desc">Token com permissao whatsapp_business_management. Fica so no seu navegador.</p>
            <label>Access Token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAxxxxxxxxxx" />
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn" onClick={refreshNumbers} disabled={busy === 'refresh'}>
                {busy === 'refresh' ? 'Buscando...' : 'Buscar numeros'}
              </button>
              <button className="btn secondary" onClick={clearAll}>Limpar lista (so a tela)</button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
