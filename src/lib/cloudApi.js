// Envio, consulta, listagem e desconexao via WhatsApp Cloud API.
import { APP } from '../config'

export function buildCurl({ phoneNumberId, token, to, text }) {
  return [
    `curl -X POST https://graph.facebook.com/${APP.graphVersion}/${phoneNumberId}/messages \\`,
    `  -H "Authorization: Bearer ${token}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"messaging_product":"whatsapp","to":"${to}","type":"text","text":{"body":"${text}"}}'`,
  ].join('\n')
}

export async function sendText({ phoneNumberId, token, to, text }) {
  const url = `https://graph.facebook.com/${APP.graphVersion}/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

// Detalhes de um numero pelo Phone Number ID.
export async function getPhoneNumberDetails({ phoneNumberId, token }) {
  const url = `https://graph.facebook.com/${APP.graphVersion}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

// Lista TODOS os numeros de uma conta (WABA).
export async function getWabaPhoneNumbers({ wabaId, token }) {
  const url = `https://graph.facebook.com/${APP.graphVersion}/${wabaId}/phone_numbers?fields=display_phone_number,verified_name,quality_rating`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

// Desconecta (deregister) o numero da Cloud API.
export async function deregisterNumber({ phoneNumberId, token }) {
  const url = `https://graph.facebook.com/${APP.graphVersion}/${phoneNumberId}/deregister`
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}
