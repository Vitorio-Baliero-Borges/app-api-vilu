// Carrega o SDK do Facebook e dispara o Embedded Signup em modo COEXISTENCIA.
import { APP } from '../config'

let sdkPromise = null

export function loadFacebookSdk() {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise((resolve) => {
    if (window.FB) { resolve(window.FB); return }
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP.appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: APP.graphVersion,
      })
      resolve(window.FB)
    }
    const s = document.createElement('script')
    s.async = true
    s.defer = true
    s.crossOrigin = 'anonymous'
    s.src = 'https://connect.facebook.net/pt_BR/sdk.js'
    document.body.appendChild(s)
  })
  return sdkPromise
}

// onData({ waba_id, phone_number_id }) e onCode(code) sao chamados quando disponiveis.
export function launchSignup({ onData, onCode, onStatus } = {}) {
  if (APP.appId.startsWith('SEU_') || APP.configurationId.startsWith('SEU_')) {
    onStatus && onStatus('Configure VITE_APP_ID e VITE_CONFIGURATION_ID antes de conectar.')
    return
  }
  onStatus && onStatus('Abrindo o pop-up da Meta...')
  window.FB.login(
    (response) => {
      if (response.authResponse && response.authResponse.code) {
        onCode && onCode(response.authResponse.code)
      } else {
        onStatus && onStatus('Login nao concluido ou permissao negada.')
      }
    },
    {
      config_id: APP.configurationId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: 'whatsapp_business_app_onboard', // COEXISTENCIA (mantem o app)
        sessionInfoVersion: '3',
      },
    }
  )
}

// Listener das mensagens do Embedded Signup (retorna waba_id / phone_number_id).
export function attachSignupListener({ onData, onStatus } = {}) {
  const handler = (event) => {
    if (!String(event.origin).endsWith('facebook.com')) return
    try {
      const data = JSON.parse(event.data)
      if (data.type !== 'WA_EMBEDDED_SIGNUP') return
      if (data.event && String(data.event).startsWith('FINISH')) {
        onData && onData(data.data || {})
      } else if (data.event === 'CANCEL') {
        onStatus && onStatus('Fluxo cancelado em: ' + (data.data && data.data.current_step))
      }
    } catch (e) { /* mensagem nao-JSON */ }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
