import { APP } from '../config'

export default function Terms() {
  return (
    <article className="card legal">
      <h1>Termos de Uso</h1>
      <p className="updated">Ultima atualizacao: 06 de julho de 2026</p>

      <p>
        Ao utilizar o aplicativo <strong>{APP.name}</strong>, voce concorda com estes Termos de Uso. O {APP.name} e um
        aplicativo de uso pessoal para conectar um numero de WhatsApp Business a Cloud API da Meta.
      </p>

      <h2>1. Uso permitido</h2>
      <p>
        O aplicativo destina-se a conectar numeros que voce possui ou administra e a enviar mensagens em conformidade
        com as politicas do WhatsApp e da Meta. Voce e responsavel pelo uso adequado da API e pelo conteudo enviado.
      </p>

      <h2>2. Conformidade com a Meta</h2>
      <p>
        O uso da Plataforma do WhatsApp Business esta sujeito aos termos e politicas da Meta, incluindo a Politica de
        Mensagens do WhatsApp Business. O descumprimento pode resultar em restricoes aplicadas pela Meta.
      </p>

      <h2>3. Isencao de garantias</h2>
      <p>
        O aplicativo e fornecido "como esta", sem garantias de disponibilidade continua ou ausencia de erros. O uso e
        por sua conta e risco.
      </p>

      <h2>4. Limitacao de responsabilidade</h2>
      <p>
        Na maxima extensao permitida por lei, o {APP.name} nao se responsabiliza por danos decorrentes do uso ou da
        impossibilidade de uso do aplicativo, nem por acoes tomadas pela Meta sobre a sua conta.
      </p>

      <h2>5. Alteracoes</h2>
      <p>Estes termos podem ser atualizados. O uso continuado apos alteracoes representa concordancia com a nova versao.</p>

      <h2>6. Contato</h2>
      <p>Contato: <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a>.</p>
    </article>
  )
}
