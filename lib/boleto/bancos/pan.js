var path = require('path'),
  gammautils = require('gammautils'),
  geradorDeDigitoPadrao = require('../geradorDeDigitoPadrao'),
  CodigoDeBarrasBuilder = require('../codigoDeBarrasBuilder'),
  pad = gammautils.string.pad,
  insert = gammautils.string.insert;


var Pan = (function() {
  var NUMERO_PAN = '623',
      DIGITO_PAN = '8',
      NOME_PAN = 'Banco Pan S/A';

  function Pan() {}

  Pan.prototype.getGeradorDeDigito = function() {
    return geradorDeDigitoPadrao;
  }

  Pan.prototype.geraCodigoDeBarrasPara = function(boleto) {
    var beneficiario = boleto.getBeneficiario()
          campoLivre = [];

    campoLivre.push(beneficiario.getAgenciaFormatada());
    campoLivre.push(this.getCarteiraFormatada(beneficiario));
    campoLivre.push(this.getCodigoFormatado(beneficiario));
    campoLivre.push(this.getNossoNumeroFormatado(beneficiario))
    campoLivre.push(this.getDigitoNossoNumero(beneficiario));

    campoLivre = campoLivre.join('');
    
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  Pan.prototype.getDigitoNossoNumero = function(beneficiario){
    var gerador = this.getGeradorDeDigito(),
        campo = [];

    campo.push(beneficiario.getAgenciaFormatada());
    campo.push(this.getCarteiraFormatada(beneficiario));
    campo.push(this.getNossoNumeroFormatado(beneficiario));

    var digito = gerador.mod10(campo.join(''));

    beneficiario.comDigitoNossoNumero(digito);

    return digito;
  }


  Pan.prototype.getNumeroFormatadoComDigito = function() {
    return [NUMERO_PAN, DIGITO_PAN].join('-');
  }

  Pan.prototype.getCarteiraFormatada = function(beneficiario) {
    return pad(beneficiario.getCarteira(), 3, '0');
  }

  Pan.prototype.getCodigoFormatado = function(beneficiario) {
    return pad(beneficiario.getCodigo(), 7, '0');
  }

  Pan.prototype.getImagem = function() {
    return path.join(__dirname, 'logotipos/banco-pan-novo.png');
  }

  Pan.prototype.getNossoNumeroFormatado = function(beneficiario) {
    return pad(beneficiario.getNossoNumero(), 10, '0');
  }

  Pan.prototype.getNossoNumeroECodigoDocumento = function(boleto) {
    var beneficiario = boleto.getBeneficiario();

    return [
      beneficiario.getCarteira(),
      this.getNossoNumeroFormatado(beneficiario),
    ].join('/') + '-' + beneficiario.getDigitoNossoNumero();
  }

  Pan.prototype.getNumeroFormatado = function() {
    return NUMERO_PAN;
  }

  Pan.prototype.getNome = function() {
    return NOME_PAN;
  }

  Pan.prototype.getImprimirNome = function() {
    return false;
  }

  Pan.prototype.getAgenciaECodigoBeneficiario = function(boleto) {
    var beneficiario = boleto.getBeneficiario(),
              codigo = pad(beneficiario.getContaCorrente(),7,'0'),
         digitoConta = beneficiario.getDigitoContaCorrente();

    if(digitoConta) {
      codigo += '-' + digitoConta;
    }

    var agencia = beneficiario.getAgenciaFormatada(),
        digitoAgencia = beneficiario.getDigitoAgencia();

    if (digitoAgencia)
      agencia += '-' + digitoAgencia;

    return agencia + '/' + codigo;
  }

  Pan.novoPan = function() {
    return new Pan();
  }

  return Pan;
})();

module.exports = Pan;
