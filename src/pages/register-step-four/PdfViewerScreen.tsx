import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfViewerScreen = () => {
  const contractHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
          margin: 0;
          line-height: 1.8;
          color: #333;
          background-color: #f9f9f9;
        }
        .contract-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 20px;
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .subtitle {
          font-size: 16px;
          color: #7f8c8d;
          font-weight: 500;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin: 25px 0 15px 0;
          padding-bottom: 5px;
          border-bottom: 1px solid #ecf0f1;
        }
        .clause {
          margin-bottom: 20px;
        }
        .clause-title {
          font-weight: 600;
          color: #6a31ff;
          margin-bottom: 5px;
        }
        .paragraph {
          margin: 10px 0;
          text-align: justify;
        }
        ul {
          margin: 10px 0;
          padding-left: 25px;
        }
        li {
          margin-bottom: 8px;
          position: relative;
        }
        li:before {
          content: "•";
          color: #6a31ff;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }
        .signature-area {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature-line {
          margin: 25px 0;
        }
        .signature-label {
          font-weight: 600;
          margin-bottom: 5px;
          display: block;
        }
        .highlight-box {
          background-color: #f8f9fa;
          border-left: 4px solid #6a31ff;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .variable {
          background-color: #f1f1f1;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #95a5a6;
          text-align: center;
        }
        .subsection-title {
          font-weight: 600;
          color: #6a31ff;
          margin: 15px 0 10px 0;
        }
        .plan-box {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin: 15px 0;
        }
        .plan-title {
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="contract-container">
        <div class="header">
          <h1>CONTRATO DE ADESÃO AO CARTÃO DE BENEFÍCIO - CONSUMIDOR FINAL</h1>
          <div class="subtitle">Documento válido e executável nos termos da legislação vigente</div>
        </div>

        <div class="section">
          <p>Pelo presente instrumento particular de adesão, de um lado a <strong>EMPRESA ADMINISTRADORA DO CARTÃO DE BENEFÍCIO</strong>, doravante denominada <strong>ADMINISTRADORA</strong>, e de outro lado o(a) consumidor(a) identificado no Termo de Adesão, doravante denominado <strong>USUÁRIO</strong>, resolvem celebrar o presente contrato de adesão ao Cartão de Benefício, mediante as cláusulas e condições a seguir:</p>
        </div>

        <!-- Seção 1 - DAS PARTES E REPRESENTANTES -->
        <div class="section">
          <div class="section-title">1. DAS PARTES E REPRESENTANTES</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 1ª. ADMINISTRADORA:</div>
            <p class="paragraph">Pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <span class="variable">[●]</span>, com sede na <span class="variable">[endereço completo]</span>, neste ato representada por seu(sua) representante legal <span class="variable">[Nome completo]</span>, <span class="variable">[nacionalidade]</span>, <span class="variable">[estado civil]</span>, <span class="variable">[profissão]</span>, portador(a) da cédula de identidade RG nº <span class="variable">[●]</span>, expedida por <span class="variable">[órgão emissor]</span>, e inscrito(a) no CPF/MF sob o nº <span class="variable">[●]</span>, telefone: <span class="variable">[●]</span>, Email: <span class="variable">[●]</span>, doravante denominada ADMINISTRADORA.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 2ª: USUÁRIO:</div>
            <p class="paragraph">Pessoa física, inscrita no CPF sob o nº <span class="variable">[●]</span>, no <span class="variable">[endereço completo]</span>, <span class="variable">[Nome completo]</span>, <span class="variable">[nacionalidade]</span>, <span class="variable">[estado civil]</span>, <span class="variable">[profissão]</span>, portador(a) da cédula de identidade RG nº <span class="variable">[●]</span>, expedida por <span class="variable">[órgão emissor]</span>, telefone: <span class="variable">[●]</span>, Email: <span class="variable">[●]</span>.</p>
          </div>
        </div>

        <!-- Seção 2 - DO ACOMPANHAMENTO CONTRATUAL -->
        <div class="section">
          <div class="section-title">2. DO ACOMPANHAMENTO CONTRATUAL E DOS RESPONSÁVEIS OPERACIONAIS</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 3ª:</div>
            <p class="paragraph">O acompanhamento, administração e execução deste contrato por parte da ADMINISTRADORA será realizado pelo <strong>Setor de Relacionamento com o Cliente</strong>, sob responsabilidade do(a) <span class="variable">[Nome completo do responsável operacional]</span>, <span class="variable">[nacionalidade]</span>, <span class="variable">[estado civil]</span>, <span class="variable">[profissão]</span>, portador(a) do RG nº <span class="variable">[●]</span> e CPF nº <span class="variable">[●]</span>, telefone: <span class="variable">[●]</span>, Email: <span class="variable">[●]</span>, designado(a) formalmente como <strong>responsável pela comunicação institucional, suporte técnico e acompanhamento junto ao USUÁRIO</strong>.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 4ª:</div>
            <p class="paragraph">No caso do USUÁRIO, este deverá ser o responsável pela interface direta com a ADMINISTRADORA, cabendo-lhe a atualização cadastral, o recebimento de comunicações, o acompanhamento das condições contratuais e a resolução de demandas operacionais. O(a) responsável será identificado(a) nos registros internos da ADMINISTRADORA com os seguintes dados:</p>
            <p class="paragraph"><span class="variable">[Nome completo]</span>, <span class="variable">[cargo]</span>, <span class="variable">[nacionalidade]</span>, <span class="variable">[estado civil]</span>, <span class="variable">[profissão]</span>, portador(a) do RG nº <span class="variable">[●]</span> e CPF nº <span class="variable">[●]</span>, telefone: <span class="variable">[●]</span>, e-mail: <span class="variable">[●]</span>.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 5ª: Canais Oficiais de Atendimento da ADMINISTRADORA ao USUÁRIO(a):</div>
            <p class="paragraph">Para fins de comunicação institucional, suporte técnico, envio de documentos, atualizações cadastrais e resolução de dúvidas, o USUÁRIO deverá utilizar exclusivamente os seguintes canais oficiais da ADMINISTRADORA:</p>
            <ul>
              <li><strong>E-mail:</strong> atendimento@<span class="variable">[empresa]</span>.com.br</li>
              <li><strong>Telefone / WhatsApp:</strong> <span class="variable">(xx) xxxx-xxxx</span></li>
              <li><strong>Aplicativo / Área do Usuário:</strong> disponível no site oficial ou no app <span class="variable">[nome da plataforma]</span>.</li>
            </ul>
          </div>
        </div>

        <!-- Seção 3 - DO OBJETO DO CONTRATO -->
        <div class="section">
          <div class="section-title">2. DO OBJETO DO CONTRATO:</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 4ª</div>
            <p class="paragraph">O presente contrato tem por objeto a adesão voluntária do USUÁRIO ao Cartão de Benefícios Gerais, que consiste em serviço de acesso a vantagens, descontos, condições promocionais, programas de fidelidade, cashback, entre outros benefícios, junto a empresas credenciadas nas áreas de saúde, educação, bem-estar, estética, lazer, alimentação, mobilidade e outras.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 5ª</div>
            <p class="paragraph">O Cartão de Benefícios não constitui plano de saúde, seguro, nem prestação direta de serviços pela ADMINISTRADORA. É um instrumento de intermediação que confere ao USUÁRIO acesso a uma rede de parceiros conveniados.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 6ª</div>
            <p class="paragraph">A adesão ao Cartão é facultativa, de natureza contratual, sendo os benefícios acessados conforme disponibilidade e política individual dos parceiros credenciados.</p>
          </div>
        </div>

        <!-- Seção 4 - DA ADESÃO -->
        <div class="section">
          <div class="section-title">3. DA ADESÃO:</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 7ª:</div>
            <p class="paragraph">A adesão ao cartão será efetivada pelo USUÁRIO, por meio de preenchimento e assinatura da proposta ou por telefone mediante gravação ou contratação online (site ou aplicativos).</p>
            <p class="paragraph"><strong>§ 1º</strong> - Em qualquer caso, implicará na sua aceitação e adesão aos termos do presente contrato.</p>
            <p class="paragraph"><strong>§ 2º:</strong> Após a adesão, a empresa enviará para o USUÁRIO o kit de boas-vindas, incluindo seu CPF já vinculado ao cartão como também de seus dependentes.</p>
            <p class="paragraph"><strong>§ 3º:</strong> O documento de identificação válido com foto é de apresentação obrigatória para que sejam concedidos ao USUÁRIO e DEPENDENTES os benefícios oferecidos pela rede de CREDENCIADOS e FORNECEDORES do CARTÃO.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 8ª:</div>
            <p class="paragraph">É de conhecimento do USUÁRIO que será cobrada uma taxa de adesão no ato da contratação do cartão individual e/ou familiar, podendo ser isenta de acordo com a campanha mensal/anual, valor vigente na data de assinatura da proposta, esta taxa não se confunde com a primeira mensalidade/anuidade.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Somente o USUÁRIO que realizar o pagamento da primeira mensalidade/anuidade, e que esteja rigorosamente em dia com suas obrigações financeiras, terá direito aos benefícios e vantagens oferecidos pelos CREDENCIADOS/FORNECEDORES.</p>
            <p class="paragraph"><strong>§ 2º:</strong> É de inteira responsabilidade do USUÁRIO manter a ADMINISTRADORA informada sobre qualquer alteração no cadastro e forma de cobrança.</p>
            <p class="paragraph"><strong>§ 3º:</strong> A ADMINISTRADORA não se responsabiliza pelas informações prestadas pelo USUÁRIO no momento da assinatura do contrato, reservando-se no direito de regresso, em caso de fraude.</p>
          </div>
        </div>

        <!-- Seção 3.1 - DOS PLANOS DISPONÍVEIS -->
        <div class="section">
          <div class="section-title">3.1 DOS PLANOS DISPONÍVEIS</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 9ª:</div>
            <p class="paragraph">O USUÁRIO poderá optar, no ato da adesão, por um dos planos abaixo:</p>
            
            <div class="plan-box">
              <div class="plan-title">Plano BÁSICO:</div>
              <ul>
                <li>Acesso à rede credenciada com descontos em consultas e exames;</li>
                <li>Disponível com ou sem serviço de telemedicina (opcional).</li>
              </ul>
            </div>
            
            <div class="plan-box">
              <div class="plan-title">Plano PREMIUM:</div>
              <ul>
                <li>Todos os benefícios do Plano Básico;</li>
                <li>Descontos adicionais em medicamentos, academias, estética e nutrição;</li>
                <li>Telemedicina ilimitada (se contratado);</li>
                <li>Acesso a programas de prevenção e bem-estar.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Seção IV - DAS OBRIGAÇÕES DAS PARTES -->
        <div class="section">
          <div class="section-title">IV – DAS OBRIGAÇÕES DAS PARTES</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 10ª:</div>
            <p class="paragraph">A ADMINISTRADORA é a única responsável pela escolha de toda a sua rede de CREDENCIADORES e FORNECEDORES, bem como pelos serviços disponibilizados, reservando-se no direito de alterá-los ou cancelá-los, a qualquer momento, sem necessidade de qualquer anuência ou comunicação prévia para o USUÁRIO ou ADICIONAIS.</p>
            <p class="paragraph"><strong>§ 1º:</strong> A ADMINISTRADORA manterá a lista dos fornecedores vinculados ao CARTÃO em seu site (www.x.com.br), podendo sofrer alterações conforme disponibilidade pelo FORNECEDOR, independentemente de anuência ou comunicação prévia ao USUÁRIO.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 11ª:</div>
            <p class="paragraph">Para informações, sugestões, reclamações ou cancelamento deste CONTRATO a ADMINISTRADORA colocará à disposição do USUÁRIO o SAC (Serviço de Atendimento ao Cliente), no(s) telefone(s) indicado(s) na página "www.X.com.br".</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 12ª:</div>
            <p class="paragraph">É de responsabilidade do USUÁRIO manter atualizado junto a ADMINISTRADORA, os seus dados cadastrais, sob pena de responsabilidade administrativa, civil e criminal.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 13ª:</div>
            <p class="paragraph">Em caso de extravio ou roubo do cartão, o USUÁRIO deverá avisar imediatamente a ADMINISTRADORA, por escrito, bem como solicitar novo cartão, que terá um custo adicional, conforme tabela de valores, na data da solicitação.</p>
          </div>
        </div>

        <!-- Seção V - DA VIGÊNCIA E DO REAJUSTE -->
        <div class="section">
          <div class="section-title">V. DA VIGÊNCIA E DO REAJUSTE</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 14ª:</div>
            <p class="paragraph">A vigência do presente contrato será de 1 (um) ano, com início na data de assinatura da proposta.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Salvo manifestação em contrário, as renovações serão automáticas, por períodos iguais e sucessivos, mediante pagamento da mensalidade/anuidade reajustada pela aplicação do IPCA acumulado no respectivo período, ou outro índice oficial que venha substituí-lo, ou no caso de alteração na ordem econômica que atinja diretamente a prestação deste serviço.</p>
            <p class="paragraph"><strong>§ 2º:</strong> O reajuste será aplicado no valor sem quaisquer descontos promocionais.</p>
            <p class="paragraph"><strong>§ 3º:</strong> O USUÁRIO poderá rescindir o presente contrato sem quaisquer ônus no prazo de sete dias contados da data da assinatura na unidade da ADMINISTRADORA, ou via atendimento (SAC) após este período, o mesmo poderá ser rescindido por qualquer uma das partes, mediante comunicação prévia de 30 (trinta) dias, fazendo por escrito, diretamente na sede da ADMINISTRADORA ou via atendimento (SAC) e cumprindo o ônus vigente.</p>
            <p class="paragraph"><strong>§ 4º:</strong> No caso de rescisão antecipada do contrato, o USUÁRIO somente poderá contratar novamente os serviços do CARTÃO num período anterior a três meses da rescisão contratual antecipada, sem o pagamento correspondente às parcelas devidas no período.</p>
            <p class="paragraph"><strong>§ 5º:</strong> Após a contratação e o pagamento da primeira mensalidade/anuidade, caso ocorra atraso de pagamento das próximas faturas, ele está sujeito a negativação. Casos de não pagamento de nenhuma mensalidade/anuidade após 60 dias o cartão será cancelado com sujeito à análise em caso de nova contratação.</p>
            <p class="paragraph"><strong>§ 6º:</strong> No caso de inobservância do prazo contratado de 12 (doze) meses, será devida multa referente a 3 parcelas no valor vigente do plano, sendo observado o período mínimo de 3 meses.</p>
            <p class="paragraph"><strong>§ 7º:</strong> Fica ressalvado o direito de cobrança extrajudicial ou judicial pela ADMINISTRADORA da(s) mensalidade(s)/anuidade(s) em atraso pelo USUÁRIO, acrescido de multa de 2% (dois por cento) e juros de 1% (um por cento) ao mês.</p>
            <p class="paragraph"><strong>§ 8º:</strong> A suspensão ou cancelamento das cobranças das mensalidades não implica em cancelamento do contrato ou renúncia da ADMINISTRADORA ao seu direito de cobrar a mensalidade do USUÁRIO por outro meio.</p>
          </div>
        </div>

        <!-- Seção VI - DO PREÇO E DA FORMA DE PAGAMENTO -->
        <div class="section">
          <div class="section-title">VI – DO PREÇO E DA FORMA DE PAGAMENTO</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 15ª:</div>
            <p class="paragraph">Considerando o plano escolhido pelo USUÁRIO o valor, bem como a forma de pagamento, será o praticado pela ADMINISTRADORA no ato da adesão com a proposta.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Caberá ao USUÁRIO o pagamento da mensalidade/anuidade conforme valor constante no contrato ou na proposta comercial, até a data do respectivo vencimento.</p>
            <p class="paragraph"><strong>§ 2º:</strong> A cobrança de eventuais benefícios adicionais ao CARTÃO que forem contratados pelo USUÁRIO serão acrescidos ao valor da mensalidade/anuidade ou cobradas em rubrica própria, enquanto permanecerem vigentes.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 16ª:</div>
            <p class="paragraph">O USUÁRIO poderá optar, pelo pagamento das mensalidades/anuidades, nas formas disponibilizadas pela ADMINISTRADORA, no ato da adesão à proposta.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Será facultado a ADMINISTRADORA, aceitar qualquer outro meio de pagamento, mediante autorização escrita, eletrônica ou gravada.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 17ª:</div>
            <p class="paragraph">A cobrança de eventuais benefícios adicionais ao CARTÃO que forem contratados, serão acrescidos ao valor da mensalidade/anuidade, através da formalização de instrumento próprio.</p>
          </div>
        </div>

        <!-- Seção VI - DO INADIMPLEMENTO -->
        <div class="section">
          <div class="section-title">VI – DO INADIMPLEMENTO</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 18ª:</div>
            <p class="paragraph">A falta ou atraso no pagamento no vencimento incidirá, cumulativamente, juros de 1% ao mês, atualização monetária pela variação do IPCA ou outro índice oficial que venha a substituí-lo, mais multa de 10%.</p>
            <p class="paragraph"><strong>§ 1º:</strong> No caso de falta ou atraso no pagamento da mensalidade superior a 30 (trinta) dias, o CARTÃO, bem como eventuais funções ou serviços adicionais poderão ser bloqueados para uso, até a purgação da mora.</p>
            <p class="paragraph"><strong>§ 2º:</strong> O USUÁRIO autoriza a inclusão nos serviços de proteção de crédito após 60 (sessenta) dias de atraso.</p>
            <p class="paragraph"><strong>§ 3º:</strong> Caso o atraso não seja regularizado em 90 (noventa) dias, o presente contrato ficará automaticamente cancelado, rescindido de pleno direito, não produzindo efeitos, direitos e/ou obrigações, não cabendo restituição de quaisquer valores anteriormente pagos, independente de notificação e/ou interpelação judicial ou extrajudicial.</p>
            <p class="paragraph"><strong>§ 4º:</strong> A prestação de informações falsas ou uso indevido do cartão ensejará rescisão imediata e eventual responsabilização civil e criminal.</p>
          </div>
        </div>

        <!-- Seção VII - DA RESCISÃO CONTRATUAL -->
        <div class="section">
          <div class="section-title">VII – DA RESCISÃO CONTRATUAL</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 19ª:</div>
            <p class="paragraph">O presente contrato poderá ser resilido a qualquer tempo pelas partes, através de comunicação escrita e/ ou outro meio inequívoco.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Sendo a solicitação feita pelo USUÁRIO, além da comunicação, torna-se imprescindível a devolução de seu cartão.</p>
            <p class="paragraph"><strong>§ 2º:</strong> Em caso de resilição, ambas as partes se obrigam a quitar seus débitos, caso tenham algum em aberto.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 20ª:</div>
            <p class="paragraph">Constituirá motivo para rescisão do contrato de forma unilateral, pela ADMINISTRADORA e consequente cancelamento do cartão em caso de:</p>
            <ul>
              <li>a) Descumprimento de qualquer cláusula contratual por parte do USUÁRIO no plano;</li>
              <li>b) Uso fraudulento do cartão;</li>
              <li>c) Cumprimento de determinação administrativa ou judicial;</li>
              <li>d) Falência ou insolvência civil;</li>
              <li>e) Cancelamento da forma de cobrança, sem que o USUÁRIO promova a substituição da forma de pagamento.</li>
            </ul>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 21ª:</div>
            <p class="paragraph">A rescisão do contrato implicará no imediato bloqueio e cancelamento dos cartões emitidos.</p>
            <p class="paragraph"><strong>§ 1º:</strong> Se, após a resilição do contrato, os cartões forem utilizados pelo USUÁRIO, tem conhecimento que a ADMINISTRADORA se reserva no direito de efetuar as devidas cobranças, sem prejuízo das demais ações pertinentes.</p>
          </div>
        </div>

        <!-- Seção VIII - COBERTURAS E EXCLUSÕES -->
        <div class="section">
          <div class="section-title">VIII – COBERTURAS E EXCLUSÕES</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 22ª:</div>
            <p class="paragraph">Os benefícios limitam-se ao que está expressamente indicado na tabela do plano contratado.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 23ª:</div>
            <p class="paragraph">Estão excluídos do escopo deste contrato, sem prejuízo de outras exclusões previstas em regulamentos específicos:</p>
            <ul>
              <li>a) Benefícios não listados ou não atualizados na rede de parceiros da ADMINISTRADORA;</li>
              <li>b) Custos adicionais cobrados pelos parceiros que não integrem o escopo do benefício (ex.: taxas administrativas, diferenciais técnicos, produtos agregados ou opcionais);</li>
              <li>c) Garantia de disponibilidade imediata ou prioritária de atendimento em qualquer área (ex.: consultas, cursos, eventos, salões, transporte ou serviços);</li>
              <li>d) Reembolso de valores pagos diretamente a parceiros, sem uso ou identificação do cartão no ato da compra ou contratação;</li>
              <li>e) Benefícios oferecidos por parceiros que tenham sido descredenciados, sem comunicação prévia por parte da ADMINISTRADORA;</li>
              <li>f) Qualquer responsabilidade por qualidade, prazo, execução, entrega ou resultados dos serviços e produtos prestados por terceiros parceiros;</li>
              <li>g) Atendimentos emergenciais, seguros de qualquer natureza, indenizações por danos ou cobertura de despesas fora do escopo promocional do benefício;</li>
              <li>h) Garantias de descontos vitalícios, valores fixos ou condições permanentes, sujeitas à alteração pela empresa parceira.</li>
            </ul>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 24ª:</div>
            <p class="paragraph">A ADMINISTRADORA atua como gestora da rede de parceiros conveniados e não se responsabiliza por perdas, vícios, danos ou prejuízos decorrentes da relação direta entre USUÁRIO e prestador, cabendo ao USUÁRIO avaliar as condições ofertadas antes de efetivar a contratação com o parceiro.</p>
          </div>
        </div>

        <!-- Seção IX - REGRAS DE UTILIZAÇÃO -->
        <div class="section">
          <div class="section-title">IX – REGRAS DE UTILIZAÇÃO</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 25ª:</div>
            <p class="paragraph">Para utilizar os benefícios, o USUÁRIO deverá:</p>
            <ul>
              <li>Estar adimplente;</li>
              <li>Apresentar o cartão ou documento digital e um documento oficial com foto;</li>
              <li>Agendar previamente, quando necessário;</li>
              <li>Respeitar as regras e políticas de cada prestador credenciado.</li>
            </ul>
          </div>
        </div>

        <!-- Seção X - PROTEÇÃO DE DADOS -->
        <div class="section">
          <div class="section-title">X. PROTEÇÃO DE DADOS</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 26ª:</div>
            <p class="paragraph">A ADMINISTRADORA manterá em sigilo os dados pessoais e sensíveis do USUÁRIO, inclusive os referentes à saúde, em conformidade com a Lei nº 13.709/2018 (LGPD).</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 27ª:</div>
            <p class="paragraph">O compartilhamento de dados ocorrerá exclusivamente para fins de execução contratual, com prestadores da rede e operadores de sistemas envolvidos na prestação do serviço.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 28ª:</div>
            <p class="paragraph">O USUÁRIO declara expresso consentimento para que A ADMINISTRADORA colete, trate e compartilhe os dados necessários ao cumprimento do objeto do presente contrato, nos termos do art. 7°, inciso V e VI da LGPD.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 29ª:</div>
            <p class="paragraph">Havendo o tratamento de dados pessoais, obrigam-se as PARTES a observarem integralmente a legislação vigente sobre a proteção de dados, sobretudo, mas não exclusivamente, a Lei Geral de Proteção de Dados Pessoais pátria nº. 13.709/2018 ("LGPDP") e, caso aplicável, o Regulamento Geral Europeu sobre a Proteção de Dados (GDPR), respondendo cada qual, na medida de suas obrigações. Cada PARTE será individualmente responsável pelo cumprimento de suas obrigações decorrentes da LGPD e das regulamentações emitidas posteriormente pela autoridade reguladora competente.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 30ª:</div>
            <p class="paragraph">O USUÁRIO deverá se responsabilizar exclusivamente pelos Dados Pessoais repassados, obrigando-se a manter a ADMINISTRADORA isenta de toda e qualquer obrigação e responsabilidade por eventuais omissões ou erros cometidos por esta no tratamento dos Dados Pessoais.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 31ª:</div>
            <p class="paragraph">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o USUÁRIO poderá, a qualquer momento, requerer à ADMINISTRADORA a exclusão definitiva de seus dados pessoais, inclusive os dados operacionais e cadastrais, desde que encerrado o vínculo contratual ou quando não mais forem necessários para cumprimento de obrigações legais ou regulatória.</p>
            <p class="paragraph"><strong>[●]1</strong> A ADMINISTRADORA compromete-se a realizar a exclusão dos dados pessoais no prazo máximo de 15 (quinze) dias úteis a partir da solicitação formal do USUÁRIO, desde que não haja impedimentos legais para tal providência.</p>
            <p class="paragraph"><strong>[●].2.</strong> Após o cumprimento da solicitação de exclusão, a ADMINISTRADORA deverá emitir e disponibilizar ao USUÁRIO um comprovante formal da exclusão dos dados, indicando a data da remoção e a extensão do procedimento realizado, nos termos do artigo 18, inciso VI, da LGPD.</p>
            <p class="paragraph"><strong>[●].3.</strong> A exclusão não abrangerá dados que, por força de obrigação legal, regulatória ou para defesa em processos judiciais e administrativos, devam ser mantidos pela ADMINISTRADORA pelo prazo legal correspondente, caso em que tais dados permanecerão armazenados em ambiente seguro e restrito.</p>
          </div>
        </div>

        <!-- Seção XI - FORNECIMENTO DE DADOS -->
        <div class="section">
          <div class="section-title">XI. FORNECIMENTO DE DADOS</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 32ª:</div>
            <p class="paragraph">O USUÁRIO deverá fornecer corretamente os dados pessoais exigidos no cadastro: nome, CPF, RG, data de nascimento, telefone, e-mail e endereço.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 33ª:</div>
            <p class="paragraph">Dados incorretos ou omissões poderão impedir o acesso aos benefícios.</p>
          </div>
        </div>

        <!-- Seção XII - PROPRIEDADE INTELECTUAL -->
        <div class="section">
          <div class="section-title">XII. PROPRIEDADE INTELECTUAL</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 34ª:</div>
            <p class="paragraph">Todas as marcas, logotipos, sites, plataformas e materiais, bem como todo o know-how da ADMINISTRADORA são protegidos por direitos de propriedade intelectual e não poderão ser reproduzidos sem autorização expressa.</p>
          </div>
        </div>

        <!-- Seção XIII - FORÇA MAIOR E CASO FORTUITO -->
        <div class="section">
          <div class="section-title">XIII. FORÇA MAIOR E CASO FORTUITO</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 35ª:</div>
            <p class="paragraph">As partes não responderão por descumprimentos contratuais resultantes de eventos imprevisíveis, como desastres naturais, greves, falhas de sistema, pandemias ou ordens judiciais.</p>
          </div>
        </div>

        <!-- Seção XIV - DA ASSINATURA DIGITAL -->
        <div class="section">
          <div class="section-title">XIV. DA ASSINATURA DIGITAL</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 36ª:</div>
            <p class="paragraph">As partes reconhecem, nos termos da Lei nº 14.063/2020, que regula assinaturas eletrônicas em documentos públicos e privados, que este contrato poderá ser formalizado por meio eletrônico, utilizando-se de ferramentas de assinatura digital ou eletrônica com mecanismos de autenticação que assegurem a integridade e a autoria das manifestações de vontade.</p>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 37ª:</div>
            <p class="paragraph">A assinatura digital realizada por meio de plataformas reconhecidas no mercado (como DocuSign, Clicksign, Certisign ou equivalentes) será válida para todos os efeitos legais, dispensando a necessidade de via física. A coleta das assinaturas digitais será realizada por meio de plataformas digitais reconhecidas no mercado, tais como DocuSign, Clicksign, Certisign ou equivalentes, que observarão o seguinte procedimento:</p>
            <ul>
              <li>a) envio do documento eletrônico para o endereço de e-mail cadastrado da parte signatária;</li>
              <li>b) autenticação do signatário por meio de mecanismos de segurança da plataforma, que podem incluir certificação digital ICP-Brasil, login e senha, autenticação em duas etapas (2FA) ou outros métodos confiáveis;</li>
              <li>c) registro automático e seguro do momento da assinatura, incluindo data e hora;</li>
              <li>d) geração de comprovante eletrônico de assinatura, contendo todas as informações necessárias para atestar a validade e integridade do documento assinado;</li>
              <li>e) disponibilização do documento assinado e do respectivo comprovante para as partes contratantes, dispensando a necessidade de via física.</li>
            </ul>
          </div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 38ª:</div>
            <p class="paragraph">O presente contrato, uma vez assinado digitalmente, terá plena eficácia jurídica e probatória, nos termos da Lei nº 14.063/2020.</p>
          </div>
        </div>

        <!-- Seção XVI - FORO -->
        <div class="section">
          <div class="section-title">XVI – FORO</div>
          
          <div class="clause">
            <div class="clause-title">Cláusula 39ª:</div>
            <p class="paragraph">As partes elegem o foro da Comarca de Fortaleza, Estado - Ceará, renunciando a qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias oriundas deste contrato.</p>
          </div>
        </div>

        <!-- Área de Assinatura -->
        <div class="signature-area">
          <p><span class="variable">[Local]</span>, <span class="variable">[Data]</span>.</p>
          
          <div class="signature-line">
            <span class="signature-label">ASSINATURA DO USUÁRIO:</span>
            <div style="height: 30px; border-bottom: 1px solid #333; width: 60%;"></div>
          </div>
          
          <div class="signature-line">
            <span class="signature-label">ASSINATURA DA ADMINISTRADORA:</span>
            <div style="height: 30px; border-bottom: 1px solid #333; width: 60%;"></div>
          </div>
          
          <div style="margin-top: 40px;">
            <p><strong>Testemunhas:</strong></p>
            
            <div style="margin: 20px 0;">
              <p><span class="variable">[NOME COMPLETO DA TESTEMUNHA 1]</span></p>
              <p>CPF nº: <span class="variable">[●]</span></p>
              <p>Assinatura Digital</p>
            </div>
            
            <div style="margin: 20px 0;">
              <p><span class="variable">[NOME COMPLETO DA TESTEMUNHA 2]</span></p>
              <p>CPF nº: <span class="variable">[●]</span></p>
              <p>Assinatura Digital</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Documento gerado eletronicamente em <span class="variable">[data]</span> - Válido sem carimbo ou assinatura física</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: contractHtml }}
        style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
});

export default PdfViewerScreen;