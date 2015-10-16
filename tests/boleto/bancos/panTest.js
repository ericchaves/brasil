var path = require('path'),
  fs = require('fs'),
  boleto = require('../../../lib/boletoUtils.js'),
  Pan = require('../../../lib/boleto/bancos/pan.js'),
  geradorDeLinhaDigitavel = require('../../../lib/boleto/geradorDeLinhaDigitavel.js'),
  GeradorDeBoleto = require('../../../lib/boleto/geradorDeBoleto.js'),

  Datas = boleto.Datas,
  Endereco = boleto.Endereco,
  Beneficiario = boleto.Beneficiario,
  Pagador = boleto.Pagador,
  Boleto = boleto.Boleto,

  banco,
  boleto,
  beneficiario,
  fx = {
    banco: 623,
    agencia:'1',
    agenciaFormatada: '0001',
    agenciaDV: 9,
    operacao: '120',
    operacaoDV: 1,
    operacaoFormatada: '0000120',
    carteira: '112',
    nossoNumero: '8026642',
    nossoNumeroFormatado: '0008026642',
    valor: 1000.00,
    vencimentoAno: 2002,
    vencimentoMes: 3,
    vencimentoDia: 25,
    documento: 8026642,
    nossoNumeroDV: 4,
    campoLivre: '0001112000120000080266424',
    codigoDeBarrasEsperado: '62399163000001000000001112000012000080266424',
    codigoDeBarrasDV: 9,
    linhaDigitavelEsperada: '62390.00117 12000.012000 00802.664243 9 16300000100000'
  };


module.exports = {
  setUp: function(done){

    var datas = Datas.novasDatas();
    datas.comDocumento(fx.vencimentoDia -1, fx.vencimentoMes, fx.vencimentoAno);
    datas.comProcessamento(fx.vencimentoDia -1, fx.vencimentoMes, fx.vencimentoAno);
    datas.comVencimento(fx.vencimentoDia, fx.vencimentoMes, fx.vencimentoAno);

    pagador = Pagador.novoPagador();
    pagador.comNome('Fulano de Tal da Silva');
    pagador.comRegistroNacional('00132781000178');

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comNome('Gammasoft Desenvolvimento de Software Ltda');
    beneficiario.comAgencia(fx.agencia);
    beneficiario.comDigitoAgencia(fx.agenciaDV);
    beneficiario.comCarteira(fx.carteira);
    beneficiario.comCodigo(fx.operacao);
    beneficiario.comDigitoCodigoBeneficiario(fx.operacaoDV);
    beneficiario.comNossoNumero(fx.nossoNumero);
    
    banco = new Pan();

    boleto = Boleto.novoBoleto();
    boleto.comDatas(datas);
    boleto.comBeneficiario(beneficiario);
    boleto.comBanco(banco);
    boleto.comPagador(pagador);
    boleto.comValorBoleto(fx.valor);
    boleto.comNumeroDoDocumento(fx.documento);

    done();
  },

  'Agência formatada deve ter 04 dígitos': function(test){
    var agencia = beneficiario.getAgenciaFormatada();
    test.equals(4, agencia.length);    
    test.equal(fx.agenciaFormatada, agencia);
    test.done();
  },

  'Nosso número formatado deve ter dez digitos': function(test) {
    var beneficiario = Beneficiario.novoBeneficiario().comNossoNumero(fx.nossoNumero),
      numeroFormatado = banco.getNossoNumeroFormatado(beneficiario);

    test.equals(10, numeroFormatado.length);
    test.equals(fx.nossoNumeroFormatado, numeroFormatado);
    test.done();
  },

  'Carteira formatada deve ter três dígitos': function(test) {
    var beneficiario = Beneficiario.novoBeneficiario().comCarteira(fx.carteira),
      numeroFormatado = banco.getCarteiraFormatada(beneficiario);

    test.equals(3, numeroFormatado.length);
    test.equals(fx.carteira, numeroFormatado);
    test.done();
  },

  'Dígito Verificador do Nosso Número deve ser calculado com Agência + Carteira + Nosso Número': function(test){
    var digitoNossoNumero = banco.getDigitoNossoNumero(beneficiario);

    test.equal(fx.nossoNumeroDV, digitoNossoNumero);
    test.done();
  },

  'Boleto deve incluir digito do nosso número em beneficiario': function(test){
    var beneficiario = Beneficiario.novoBeneficiario()
                            .comNome('Gammasoft Desenvolvimento de Software Ltda')
                            .comAgencia(fx.agencia)
                            .comDigitoAgencia(fx.agenciaDV)
                            .comCarteira(fx.carteira)
                            .comCodigo(fx.operacao)
                            .comDigitoCodigoBeneficiario(fx.operacaoDV)
                            .comNossoNumero(fx.nossoNumero);

    var digito = banco.getDigitoNossoNumero(beneficiario);

    test.equal(fx.nossoNumeroDV, digito);
    test.equal(fx.nossoNumeroDV, beneficiario.getDigitoNossoNumero());
    test.done();
  },
  
  'Codigo formatado deve ter sete dígitos (aka Operação ou Conta)': function(test) {
    var numeroFormatado = banco.getCodigoFormatado(beneficiario);

    test.equals(7, numeroFormatado.length);
    test.equals(fx.operacaoFormatada, numeroFormatado);
    test.done();
  },

  'Boleto deve imprimir Agência e Código com digito no formato NNNN-D/NNNNNNN-D': function(test){
    var text = banco.getAgenciaECodigoBeneficiario(boleto);
    test.ok(/^\d{4}-\d\/\d{7}-\d$/.test(text));
    test.done();
  },

  /* IMPRESSAO DESABILITADA
  'Verifica nome correto do banco na impressão: Panamericano': function(test) {
    test.equals(banco.getNome(), 'Panamericano');
    test.done();
  },
  */
  'Verifica a numeração correta do banco: 623-8': function(test) {
    test.equal(banco.getNumeroFormatadoComDigito(), '623-8');
    test.done();
  },

  'Verifica não deve imprimir o nome do banco no boleto': function(test) {
    test.ok(!banco.getImprimirNome());
    test.done();
  },

  'Verifica a existência do arquivo de imagem do logotipo': function(test) {
      test.ok(fs.existsSync(banco.getImagem()));
      test.done();
  },
  
  'Verifica código de barras': function(test){
    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);
  
    test.equal(fx.codigoDeBarrasEsperado, codigoDeBarras);
    test.done();
  },
  
  'Verifica geração da linha digitável - 1': function(test) {
    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);

    test.equal(fx.linhaDigitavelEsperada, geradorDeLinhaDigitavel(codigoDeBarras, banco));
    test.done();
  },
  /*
  
  'Verifica geração da linha digitável - 2': function(test) {
    datas = Datas.novasDatas();
    datas.comDocumento(20, 03, 2014);
    datas.comProcessamento(20, 03, 2014);
    datas.comVencimento(10, 04, 2014);

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comNome('Mario Amaral');
    beneficiario.comAgencia('8462');
    beneficiario.comCarteira('174');
    beneficiario.comCodigo('05825');
    beneficiario.comNossoNumero('00015135')
    beneficiario.comDigitoNossoNumero('6');

    pagador = Pagador.novoPagador();
    pagador.comNome('Rodrigo de Sousa');

      boleto = Boleto.novoBoleto();
      boleto.comDatas(datas);
      boleto.comBeneficiario(beneficiario);
      boleto.comBanco(banco);
      boleto.comPagador(pagador);
      boleto.comValorBoleto(2680.16);
      boleto.comNumeroDoDocumento('575');
    boleto.comBanco(banco);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
      linhaEsperada = '34191.74002 01513.568467 20582.590004 6 60290000268016';

    test.equal(linhaEsperada, geradorDeLinhaDigitavel(codigoDeBarras, banco));
    test.done();
  },

  'Verifica geração da linha digitável - 3': function(test) {
    datas = Datas.novasDatas();
    datas.comDocumento(21, 5, 2014);
    datas.comProcessamento(21, 5, 2014);
    datas.comVencimento(21, 5, 2014);

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comCarteira('181');
    beneficiario.comAgencia('654');
    beneficiario.comContaCorrente('8711'); //Não se deve indicar o dígito da agencia
    beneficiario.comNossoNumero('94588021')
    beneficiario.comDigitoNossoNumero('4');

    pagador = Pagador.novoPagador();

      boleto = Boleto.novoBoleto();
      boleto.comEspecieDocumento('DSI');
      boleto.comDatas(datas);
      boleto.comBeneficiario(beneficiario);
      boleto.comBanco(banco);
      boleto.comPagador(pagador);
      boleto.comValorBoleto(575);
      boleto.comNumeroDoDocumento('1');
    boleto.comBanco(banco);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
      linhaEsperada = '34191.81940 58802.140655 40871.130007 4 60700000057500',
      linhaGerada = geradorDeLinhaDigitavel(codigoDeBarras, banco);

    test.equal(linhaEsperada, linhaGerada);
    test.done();
  },

  'Verifica geração da linha digitável - 4': function(test) {
    datas = Datas.novasDatas();
    datas.comDocumento(29, 5, 2014);
    datas.comProcessamento(29, 5, 2014);
    datas.comVencimento(23, 6, 2014);

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comCarteira('157');
    beneficiario.comAgencia('654');
    beneficiario.comContaCorrente('8711'); //Não se deve indicar o dígito da agencia
    beneficiario.comNossoNumero('89605074')
    beneficiario.comDigitoNossoNumero('2');

    pagador = Pagador.novoPagador();

      boleto = Boleto.novoBoleto();
      boleto.comEspecieDocumento('DSI');
      boleto.comDatas(datas);
      boleto.comBeneficiario(beneficiario);
      boleto.comBanco(banco);
      boleto.comPagador(pagador);
      boleto.comValorBoleto(115.38);
      boleto.comNumeroDoDocumento('2');
    boleto.comBanco(banco);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
      linhaEsperada = '34191.57890 60507.420655 40871.130007 1 61030000011538',
      linhaGerada = geradorDeLinhaDigitavel(codigoDeBarras, banco);

    test.equal(linhaEsperada, linhaGerada);
    test.done();
  },

  'Verifica geração da linha digitável - 5': function(test) {
    datas = Datas.novasDatas();
    datas.comDocumento(20, 8, 2014);
    datas.comProcessamento(20, 8, 2014);
    datas.comVencimento(27, 8, 2014);

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comCarteira('157');
    beneficiario.comAgencia('654');
    beneficiario.comContaCorrente('8711'); //Não se deve indicar o dígito da agencia
    beneficiario.comNossoNumero('02891620')
    beneficiario.comDigitoNossoNumero('8');

    pagador = Pagador.novoPagador();

      boleto = Boleto.novoBoleto();
      boleto.comEspecieDocumento('DSI');
      boleto.comDatas(datas);
      boleto.comBeneficiario(beneficiario);
      boleto.comBanco(banco);
      boleto.comPagador(pagador);
      boleto.comValorBoleto(115.38);
      boleto.comNumeroDoDocumento('4');
    boleto.comBanco(banco);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
      linhaEsperada = '34191.57023 89162.080652 40871.130007 4 61680000011538',
      linhaGerada = geradorDeLinhaDigitavel(codigoDeBarras, banco);

    test.equal(linhaEsperada, linhaGerada);
    test.done();
  },

  'Verifica geração da linha digitável - 6': function(test) {
    datas = Datas.novasDatas();
    datas.comDocumento(19, 9, 2014);
    datas.comProcessamento(19, 9, 2014);
    datas.comVencimento(26, 9, 2014);

    beneficiario = Beneficiario.novoBeneficiario();
    beneficiario.comCarteira('157');
    beneficiario.comAgencia('654');
    beneficiario.comContaCorrente('8711'); //Não se deve indicar o dígito da agencia
    beneficiario.comNossoNumero('07967777')
    beneficiario.comDigitoNossoNumero('4');

    pagador = Pagador.novoPagador();

      boleto = Boleto.novoBoleto();
      boleto.comEspecieDocumento('FS');
      boleto.comDatas(datas);
      boleto.comBeneficiario(beneficiario);
      boleto.comBanco(banco);
      boleto.comPagador(pagador);
      boleto.comValorBoleto(230.76);
      boleto.comNumeroDoDocumento('5');
    boleto.comBanco(banco);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
      linhaEsperada = '34191.57072 96777.740653 40871.130007 9 61980000023076',
      linhaGerada = geradorDeLinhaDigitavel(codigoDeBarras, banco);

    test.equal(linhaEsperada, linhaGerada);
    test.done();
  },

  */
  'Verifica criação de pdf': function(test) { //Mover para teste adequado

    var banco2 = new Pan();

    var datas2 = Datas.novasDatas();
    datas2.comDocumento(11, 4, 2013);
    datas2.comProcessamento(11, 4, 2013);
    datas2.comVencimento(12, 4, 2013);

    var beneficiario2 = Beneficiario.novoBeneficiario();
    beneficiario2.comNome('José da Silva');
    beneficiario2.comRegistroNacional('397.861.533-91');
    beneficiario2.comCarteira('121');
    beneficiario2.comAgencia('1');
    beneficiario2.comDigitoAgencia('9');
    beneficiario2.comContaCorrente('3343'); //Não se deve indicar o dígito da conta
    beneficiario.comDigitoContaCorrente('1');
    beneficiario2.comNossoNumero('42859826')
    beneficiario2.comDigitoNossoNumero('5');

    var pagador2 = Pagador.novoPagador();
    pagador2.comNome('Asnésio da Silva');

    var boleto2 = Boleto.novoBoleto();
    boleto2.comEspecieDocumento('RC');
    boleto2.comDatas(datas2);
    boleto2.comBeneficiario(beneficiario2);
    boleto2.comBanco(banco);
    boleto2.comPagador(pagador2);
    boleto2.comValorBoleto(764.92);
    boleto2.comNumeroDoDocumento('42859826');
    boleto2.comBanco(banco2);

    var enderecoDoPagador = Endereco.novoEndereco();
    enderecoDoPagador.comLogradouro('Avenida dos Testes Unitários');
    enderecoDoPagador.comBairro('Barra da Tijuca');
    enderecoDoPagador.comCep('72000000');
    enderecoDoPagador.comCidade('Rio de Janeiro');
    enderecoDoPagador.comUf('RJ');

    pagador2.comEndereco(enderecoDoPagador);

    boleto2.comLocaisDePagamento([
      'Pagável em qualquer banco ou casa lotérica até o vencimento',
      'Após o vencimento pagável apenas em agências Itaú'
    ]);

    boleto2.comInstrucoes([
      'Conceder desconto de R$ 10,00 até o vencimento',
      'Multa de R$ 2,34 após o vencimento',
      'Mora de R$ 0,76 ao dia após o vencimento',
      'Protestar após 10 dias de vencido',
      'Agradecemos a preferência, volte sempre!'
    ]);

    var geradorDeBoleto = new GeradorDeBoleto([boleto2, boleto]);

    geradorDeBoleto.gerarPDF(function boletosGerados(err, pdf) {
      test.ifError(err);

      var caminhoDoArquivo = path.join(__dirname, '/boleto-pan.pdf');
      writeStream = fs.createWriteStream(caminhoDoArquivo);

      pdf.pipe(writeStream);

      writeStream.on('close', function() {
        test.ok(fs.existsSync(caminhoDoArquivo));
        test.done();
      });
    });
  }
}
