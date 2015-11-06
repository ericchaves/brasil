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
    contaCorrente: '590503',
    digitoContaCorrente: 8,
    operacao: '120',
    operacaoFormatada: '0000120',
    contaCorrenteFormatada: '0590503',
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

    var datas = Datas.novasDatas()
                    .comDocumento(24, 3, 2002)
                    .comProcessamento(24, 3, 2002)
                    .comVencimento(25, 3, 2002);

    pagador = Pagador.novoPagador();
    pagador.comNome('Fulano de Tal da Silva');
    pagador.comRegistroNacional('00132781000178');

    beneficiario = Beneficiario.novoBeneficiario()
                    .comNome('Empresa de Recuperação de crédito Ltda')
                    .comAgencia('1')
                    // conta corrente se informada altera apenas impressao PDF
                    //.comContaCorrente(fx.contaCorrente) 
                    //.comDigitoContaCorrente(fx.digitoContaCorrente)
                    .comCodigo('120')
                    .comDigitoAgencia('9')
                    .comCarteira('112')
                    .comNossoNumero('8026642');
    
    banco = new Pan();

    boleto = Boleto.novoBoleto()
              .comDatas(datas)
              .comBeneficiario(beneficiario)
              .comBanco(banco)
              .comPagador(pagador)
              .comValorBoleto(1000.00)
              .comNumeroDoDocumento('8026642');

    done();
  },

  'Agência formatada deve ter 04 dígitos': function(test){
    var agencia = beneficiario.getAgenciaFormatada();
    test.equals(4, agencia.length);    
    test.equal('0001', agencia);
    test.done();
  },

  'Nosso número formatado deve ter dez digitos': function(test) {
    var numeroFormatado = banco.getNossoNumeroFormatado(beneficiario);

    test.equals(10, numeroFormatado.length);
    test.equals('0008026642', numeroFormatado);
    test.done();
  },

  'Carteira formatada deve ter três dígitos': function(test) {
    var beneficiario = Beneficiario.novoBeneficiario().comCarteira(fx.carteira),
      numeroFormatado = banco.getCarteiraFormatada(beneficiario);

    test.equals(3, numeroFormatado.length);
    test.equals('112', numeroFormatado);
    test.done();
  },

  'Dígito Verificador do Nosso Número deve ser calculado com Agência + Carteira + Nosso Número': function(test){
    var digitoNossoNumero = banco.getDigitoNossoNumero(beneficiario);

    test.equal('4', digitoNossoNumero);
    test.equal('4', beneficiario.getDigitoNossoNumero());
    test.done();
  },
  
  'Codigo formatado deve ter sete dígitos': function(test) {
    var numeroFormatado = banco.getCodigoFormatado(beneficiario);

    test.equals(7, numeroFormatado.length);
    test.equals('0000120', numeroFormatado);
    test.done();
  },

  'Boleto deve imprimir Agência e Código com digito no formato NNNN-D/NNNNNNN': function(test){
    var text = banco.getAgenciaECodigoBeneficiario(boleto);
    test.equals('0001-9/0000120', text);
    test.done();
  },  

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
  
    test.equal('62399163000001000000001112000012000080266424', codigoDeBarras);
    test.done();
  },
  
  'Verifica geração da linha digitável - 1': function(test) {
    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);

    test.equal('62390.00117 12000.012000 00802.664243 9 16300000100000', geradorDeLinhaDigitavel(codigoDeBarras, banco));
    test.done();
  },
  
  'Se conta corrente e codigo forem informados o codigo de barras deve ser calculado com codigo': function(test){
    var _beneficiario = Beneficiario.novoBeneficiario()
                                    .comNome('Empresa de Recuperação de crédito Ltda')
                                    .comAgencia('1')
                                    // conta corrente se informada altera apenas impressao PDF
                                    .comContaCorrente('590503') 
                                    .comDigitoContaCorrente('8')
                                    .comCodigo('120')
                                    .comDigitoAgencia('9')
                                    .comCarteira('112')
                                    .comNossoNumero('8026642');

    var numeroFormatado = banco.getCodigoFormatado(_beneficiario);
    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);
    
    test.equal(7, numeroFormatado.length);
    test.equals('0000120', numeroFormatado);    
    test.equal('62399163000001000000001112000012000080266424', codigoDeBarras);
    test.equal('62390.00117 12000.012000 00802.664243 9 16300000100000', geradorDeLinhaDigitavel(codigoDeBarras, banco));
    test.done();
  },
  
  'Verifica criação de pdf 1 - informando apenas operacao': function(test) { //Mover para teste adequado

    var banco2 = new Pan();

    var datas2 = Datas.novasDatas()
                      .comDocumento(11, 4, 2013)
                      .comProcessamento(11, 4, 2013)
                      .comVencimento(12, 4, 2013);

    var beneficiario2 = Beneficiario.novoBeneficiario()
                        .comNome('José da Silva')
                        .comRegistroNacional('397.861.533-91')
                        .comCarteira('121')
                        .comAgencia('1')
                        .comDigitoAgencia('9')
                        .comCodigo('3343')
                        .comNossoNumero('42859826')
                        .comDigitoNossoNumero('5');

    var enderecoDoPagador = Endereco.novoEndereco()
                                    .comLogradouro('Avenida dos Testes Unitários')
                                    .comBairro('Barra da Tijuca')
                                    .comCep('72000000')
                                    .comCidade('Rio de Janeiro')
                                    .comUf('RJ');

    var pagador2 = Pagador.novoPagador()
                          .comNome('Asnésio da Silva')
                          .comEndereco(enderecoDoPagador);

    var boleto2 = Boleto.novoBoleto()
                         .comEspecieDocumento('RC')
                         .comDatas(datas2)
                         .comBeneficiario(beneficiario2)
                         .comBanco(banco)
                         .comPagador(pagador2)
                         .comValorBoleto(764.92)
                         .comNumeroDoDocumento('42859826')
                         .comBanco(banco2);

    
    boleto2.comLocaisDePagamento([
      'Pagável em qualquer banco ou casa lotérica até o vencimento',
      'Após o vencimento pagável apenas em agências do Banco PAN'
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

      var caminhoDoArquivo = path.join(__dirname, '/boleto-pan-1.pdf');
      writeStream = fs.createWriteStream(caminhoDoArquivo);

      pdf.pipe(writeStream);

      writeStream.on('close', function() {
        test.ok(fs.existsSync(caminhoDoArquivo));
        test.done();
      });
    });
  },

  
  'Verifica criação de pdf 2 - com conta corrente': function(test) { //Mover para teste adequado

    var banco3 = new Pan();

    var datas3 = Datas.novasDatas()
                      .comDocumento(23, 10, 2015)
                      .comProcessamento(22, 10, 2015)
                      .comVencimento(23, 10, 2015);

    var beneficiario3 = Beneficiario.novoBeneficiario()
                                    .comNome('Banco Pan S/A')
                                    .comRegistroNacional('59.285.411/0001-13')
                                    .comCarteira('121')
                                    .comAgencia('1')
                                    .comDigitoAgencia('9')
                                    .comCodigo('103')
                                    .comContaCorrente('7832')
                                    .comDigitoContaCorrente('0')
                                    .comNossoNumero('1038955419');
    
    var enderecoDoPagador = Endereco.novoEndereco()
                                    .comLogradouro('Avenida dos Testes Unitários')
                                    .comBairro('Barra da Tijuca')
                                    .comCep('72000000')
                                    .comCidade('Rio de Janeiro')
                                    .comUf('RJ');


    var pagador3 = Pagador.novoPagador()
                          .comNome('JOAQUIM RIBEIRO JUNES')
                          .comRegistroNacional('663.057.135-53')
                          .comEndereco(enderecoDoPagador);

    var boleto3 = Boleto.novoBoleto()
                        .comEspecieDocumento('RC')
                        .comDatas(datas3)
                        .comBeneficiario(beneficiario3)
                        .comBanco(banco)
                        .comPagador(pagador3)
                        .comValorBoleto(700.91)
                        .comNumeroDoDocumento('1038955419')
                        .comBanco(banco3);


    boleto3.comLocaisDePagamento([
      'Pagável em qualquer banco ou casa lotérica até o vencimento',
      'Após o vencimento não receber.'
    ]);

    boleto3.comInstrucoes([
      'Contrato: 000051168269',
      '',
      'Sr. Caixa, não receber após o vencimento.',
      'Outras instruções de exemplo.'
    ]);

    var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto3);
    test.equal('62393659000000700910001121000010310389554199', codigoDeBarras);
    test.equal('62390.00117 21000.010310 03895.541997 3 65900000070091', geradorDeLinhaDigitavel(codigoDeBarras, banco3));


    var geradorDeBoleto = new GeradorDeBoleto([boleto3]);

    geradorDeBoleto.gerarPDF(function boletosGerados(err, pdf) {
      test.ifError(err);

      var caminhoDoArquivo = path.join(__dirname, '/boleto-pan-2.pdf');
      writeStream = fs.createWriteStream(caminhoDoArquivo);

      pdf.pipe(writeStream);

      writeStream.on('close', function() {
        test.ok(fs.existsSync(caminhoDoArquivo));
        test.done();
      });
    });
  }
  
}
