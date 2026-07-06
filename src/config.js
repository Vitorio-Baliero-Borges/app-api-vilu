// ===== Configuracao central do Api Vilu =====
// Troque os valores pelo seu App ID e Configuration ID (ver .env.example).
export const APP = {
  name: 'API VLUK',
  tagline: 'Conecte seu numero WhatsApp Business a API oficial da Meta',
  contactEmail: 'vitorio.baliero.borges@gmail.com',
  // Lidos das variaveis de ambiente da Vercel/Vite; ha fallback para edicao manual.
  appId: import.meta.env.VITE_APP_ID || '27355701487421987',
  configurationId: import.meta.env.VITE_CONFIGURATION_ID || '1723994788620316',
  graphVersion: import.meta.env.VITE_GRAPH_VERSION || 'v21.0',
}
