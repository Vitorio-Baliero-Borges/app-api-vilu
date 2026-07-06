import { useState } from 'react'
import { sendText, buildCurl } from '../lib/cloudApi'

export default function TestMessage() {
  const [form, setForm] = useState({ phoneNumberId: '', token: '', to: '', text: 'Ola! Mensagem de teste via Api Vilu.' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSend = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await sendText(form)
      setResult({ ok: r.ok, text: JSON.stringify(r.json, null, 2), status: r.status })
    } catch (e) {
      setResult({ ok: false, text: 'Erro de rede/CORS: ' + e.message + '\n\nUse o comando curl abaixo como alternativa para o video.' })
    } finally { setLoading(false) }
  }

  return (
    <>
      <section className="hero">
        <h1>Teste de envio</h1>
        <p>Envie uma mensagem de texto pela Cloud API. Use esta tela para gravar o video da analise do app da Meta.</p>
      </section>

      <section className="card">
        <h2>Enviar mensagem</h2>
        <p className="desc">Cole o Phone Number ID e um token valido (temporario ou permanente). Estes dados ficam so no seu navegador.</p>
        <div className="grid">
          <div>
            <label>Phone Number ID</label>
            <input value={form.phoneNumberId} onChange={set('phoneNumberId')} placeholder="15xxxxxxxxxx" />
          </div>
          <div>
            <label>Numero destino (com pais + DDD)</label>
            <input value={form.to} onChange={set('to')} placeholder="5511999999999" />
          </div>
        </div>
        <label>Access Token</label>
        <input value={form.token} onChange={set('token')} placeholder="EAAxxxxxxxxxx" />
        <label>Mensagem</label>
        <textarea value={form.text} onChange={set('text')} />
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={handleSend} disabled={loading}>{loading ? 'Enviando...' : 'Enviar mensagem'}</button>
        </div>
        {result && (
          <div className={'status ' + (result.ok ? 'ok' : 'err')}>
            {result.ok ? 'Enviado com sucesso!' : 'Falha no envio.'} {result.status ? '(HTTP ' + result.status + ')' : ''}
            {'\n'}{result.text}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Comando curl equivalente</h2>
        <p className="desc">Alternativa caso o navegador bloqueie a requisicao (CORS). Rode no terminal para o video de <code>whatsapp_business_management</code>.</p>
        <pre>{buildCurl(form)}</pre>
      </section>
    </>
  )
}
