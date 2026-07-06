import { APP } from '../config'

export default function Privacy() {
  return (
    <article className="card legal">
      <h1>Politica de Privacidade</h1>
      <p className="updated">Ultima atualizacao: 06 de julho de 2026</p>

      <p>
        Esta Politica de Privacidade descreve como o aplicativo <strong>{APP.name}</strong> ("aplicativo", "nos")
        trata as informacoes ao conectar um numero de telefone do WhatsApp Business a Plataforma do WhatsApp Business
        (Cloud API) da Meta. O {APP.name} e um aplicativo de uso pessoal.
      </p>

      <h2>1. Dados que tratamos</h2>
      <p>Para viabilizar a conexao com a Cloud API, o aplicativo pode acessar e processar:</p>
      <ul>
        <li>Identificadores da conta do WhatsApp Business (WABA ID) e do numero de telefone (Phone Number ID);</li>
        <li>Tokens de acesso fornecidos pela Meta durante a autenticacao;</li>
        <li>Conteudo de mensagens estritamente quando enviado por meio da funcionalidade de teste, iniciada por voce.</li>
      </ul>

      <h2>2. Como usamos os dados</h2>
      <p>
        Os dados sao utilizados unicamente para estabelecer e operar a conexao com a Cloud API da Meta e para permitir o
        envio de mensagens de teste. Nao vendemos, alugamos nem compartilhamos esses dados com terceiros para fins de
        marketing.
      </p>

      <h2>3. Armazenamento</h2>
      <p>
        Identificadores exibidos na interface (como WABA ID e Phone Number ID) podem ser guardados localmente no
        navegador do proprio usuario (localStorage) apenas para exibicao. Tokens informados na tela de teste permanecem
        no navegador durante a sessao e nao sao enviados a servidores nossos.
      </p>

      <h2>4. Compartilhamento com a Meta</h2>
      <p>
        O aplicativo se integra a Plataforma do WhatsApp Business. O tratamento de mensagens e dados pela Meta segue as
        politicas da propria Meta, disponiveis em suas paginas oficiais.
      </p>

      <h2>5. Seguranca</h2>
      <p>
        Adotamos praticas razoaveis para proteger as informacoes. Ainda assim, nenhum metodo de transmissao ou
        armazenamento e 100% seguro.
      </p>

      <h2>6. Seus direitos</h2>
      <p>
        Voce pode, a qualquer momento, desconectar o numero, revogar tokens no painel da Meta e limpar os dados
        armazenados localmente pelo botao "Limpar" na tela inicial.
      </p>

      <h2>7. Contato</h2>
      <p>
        Duvidas sobre esta politica podem ser enviadas para <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a>.
      </p>
    </article>
  )
}
