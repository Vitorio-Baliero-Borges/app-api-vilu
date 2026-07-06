import { useEffect, useState } from 'react'
import { APP } from '../config'
import { loadFacebookSdk, launchSignup, attachSignupListener } from '../lib/embeddedSignup'
import { getPhoneNumberDetails, deregisterNumber } from '../lib/cloudApi'

const STORE_KEY = 'apivilu_connection'

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
    if (!token) return setStatus('Cole um token para desconectar (permissao whatsapp_business_management).')
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
        <button className="btn" onClick={handleConnect} disabled={!ready}>
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
            <label>Numero conectado</label>
            <input readOnly value={conn.phone_number ? (conn.phone_number + (conn.verified_name ? '  -  ' + conn.verified_name : '')) : 'Nao informado - use "Buscar numero" abaixo'} />
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
