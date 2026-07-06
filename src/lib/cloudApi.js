// Envio de mensagem de texto via WhatsApp Cloud API (para o video da analise).
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
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}
