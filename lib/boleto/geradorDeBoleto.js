var path = require('path'),
	fs = require('fs'),
	EOL = require('os').EOL,

	gammautils = require('gammautils'),
	generateGuid = gammautils.string.generateGuid,
	merge = gammautils.object.merge,
	Pdf = require('pdfkit'),

	geradorDeLinhaDigitavel = require('./geradorDeLinhaDigitavel'),

	diretorioDeFontes = path.join(__dirname, '/fontes'),
	timesNewRoman = path.join(diretorioDeFontes, 'Times New Roman.ttf'),
	timesNewRomanNegrito = path.join(diretorioDeFontes, 'Times New Roman Bold.ttf'),
	timesNewRomanItalico = path.join(diretorioDeFontes, 'Times New Roman Italic.ttf'),
	timesNewRomanNegritoItalico = path.join(diretorioDeFontes, 'Times New Roman Bold Italic.ttf'),
	code25I = path.join(diretorioDeFontes, 'Code25I.ttf');

var GeradorDeBoleto = (function() {
	function GeradorDeBoleto(boletos) {
		if(!Array.isArray(boletos)) {
			boletos = [boletos];
		}

		this._boletos = boletos;
	}

	var pdfDefaults = {
		ajusteY: -80,
		ajusteX: 0,
		autor: '',
		titulo: '',
		criador: '',
		tamanhoDaFonteDoTitulo: 8,
		tamanhoDaFonte: 10,
		tamanhoDaLinhaDigitavel: 14,
		tamanhoDoCodigoDeBarras: 26,
		imprimirSequenciaDoBoleto: true,
		corDoLayout: 'black',
		alturaDaPagina: 595.44,
		larguraDaPagina: 841.68,
		exibirCampoUnidadeBeneficiaria: false,
		creditos: 'http://opensource.gammasoft.com.br/brasil',
		template: path.join(__dirname, '/templates/template.pdf')
	};

	GeradorDeBoleto.prototype.gerarPDF = function(args, callback) {
		if(typeof args === 'function') {
			callback = args;
			args = pdfDefaults;
		}

		args = merge(pdfDefaults, args);

		var boletos = this._boletos,
			pdf = new Pdf({
				size: [
					args.alturaDaPagina,
					args.larguraDaPagina
				],
				info: {
					Author: args.autor,
					Title: args.titulo,
					Creator: args.criador,
					Producer: 'http://opensource.gammasoft.com.br/brasil'
				}
			});

		if(args.stream) {
			pdf.pipe(args.stream);
		}

		pdf.registerFont('normal', timesNewRoman);
		pdf.registerFont('negrito', timesNewRomanNegrito);
		pdf.registerFont('italico', timesNewRomanItalico);
		pdf.registerFont('negrito-italico', timesNewRomanNegritoItalico);
		pdf.registerFont('codigoDeBarras', code25I);

		boletos.forEach(function escreveOsDadosDoBoleto(boleto, indice) {
			//IMPRIMIR LAYOUT
			var espacoEntreLinhas = 23;

			var linha1 = 131;
			pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1)
			    .lineTo(args.ajusteX + 572, args.ajusteY + linha1)
			    .stroke(args.corDoLayout);

			var linha2 = linha1 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha2)
			    .lineTo(args.ajusteX + 572, args.ajusteY + linha2)
			    .stroke(args.corDoLayout);

			var linha3 = linha2 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha3)
			    .lineTo(args.ajusteX + 329, args.ajusteY + linha3)
			    .stroke(args.corDoLayout);

			var coluna1 = 27;
			pdf.moveTo(args.ajusteX + coluna1, args.ajusteY + linha1 - 0.5)
			    .lineTo(args.ajusteX + coluna1, args.ajusteY + linha3 + 0.5)
			    .stroke(args.corDoLayout);

			var coluna2 = 329;
			pdf.moveTo(args.ajusteX + coluna2, args.ajusteY + linha1)
			    .lineTo(args.ajusteX + coluna2, args.ajusteY + linha3 + 0.5)
			    .stroke(args.corDoLayout);

			var coluna3 = 178;
			pdf.moveTo(args.ajusteX + coluna3, args.ajusteY + linha2)
			    .lineTo(args.ajusteX + coluna3, args.ajusteY + linha3)
			    .stroke(args.corDoLayout);

			var coluna4 = 420;
			pdf.moveTo(args.ajusteX + coluna4, args.ajusteY + linha1)
			    .lineTo(args.ajusteX + coluna4, args.ajusteY + linha2)
			    .stroke(args.corDoLayout);

			var coluna5 = 572;
			pdf.moveTo(args.ajusteX + coluna5, args.ajusteY + linha1 - 0.5)
			    .lineTo(args.ajusteX + coluna5, args.ajusteY + linha2 + 0.5)
			    .stroke(args.corDoLayout);

			var coluna6 = coluna2 + 4;
			pdf.moveTo(args.ajusteX + coluna6, args.ajusteY + linha2 + 3.5)
			    .lineTo(args.ajusteX + coluna6, args.ajusteY + linha3 + 0.5)
			    .stroke(args.corDoLayout);

			var coluna7 = coluna5;
			pdf.moveTo(args.ajusteX + coluna7, args.ajusteY + linha2 + 3.5)
			    .lineTo(args.ajusteX + coluna7, args.ajusteY + linha3 + 0.5)
			    .stroke(args.corDoLayout);

			var linha4 = linha2 + 4;
			pdf.moveTo(args.ajusteX + coluna6, args.ajusteY + linha4)
			    .lineTo(args.ajusteX + coluna7, args.ajusteY + linha4)
			    .stroke(args.corDoLayout);

			//////////////////

			var margemDoSegundoBloco = 30,
				margemDoSegundoBlocoLayout = margemDoSegundoBloco - 4;

			var linha21 = 241;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha21)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var linha22 = linha21 + espacoEntreLinhas + 8;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha22)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha22)
			    .stroke(args.corDoLayout);

			var linha23 = linha22 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha23)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha23)
			    .stroke(args.corDoLayout);

			var linha24 = linha23 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha24)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha24)
			    .stroke(args.corDoLayout);

			var linha25 = linha24 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha25)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha25)
			    .stroke(args.corDoLayout);

		    var camposLaterais = 434,
				linha26 = linha25 + espacoEntreLinhas;

			pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha26)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha26)
			    .stroke(args.corDoLayout);

		    var linha27 = linha26 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha27)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha27)
			    .stroke(args.corDoLayout);

		    var linha28 = linha27 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha28)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha28)
			    .stroke(args.corDoLayout);

			if(args.exibirCampoUnidadeBeneficiaria) {
			    var linha28_2 = linha28 + 12.4;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha28_2)
				    .lineTo(args.ajusteX + camposLaterais, args.ajusteY + linha28_2)
				    .stroke(args.corDoLayout);
			}

		    var linha29 = linha28 + espacoEntreLinhas;
			pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha29)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha29)
			    .stroke(args.corDoLayout);

		    var linha211 = linha29 + espacoEntreLinhas + 0.4;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha211)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha211)
			    .stroke(args.corDoLayout);

		    var linha212 = linha211 + 56.6;
			pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha212)
			    .lineTo(args.ajusteX + 571, args.ajusteY + linha212)
			    .stroke(args.corDoLayout);

			var coluna21 = margemDoSegundoBlocoLayout + 0.5;
			pdf.moveTo(args.ajusteX + coluna21, args.ajusteY + linha21)
			    .lineTo(args.ajusteX + coluna21, args.ajusteY + linha212)
			    .stroke(args.corDoLayout);

			var coluna22 = 571 - 0.5;
			pdf.moveTo(args.ajusteX + coluna22, args.ajusteY + linha21)
			    .lineTo(args.ajusteX + coluna22, args.ajusteY + linha212)
			    .stroke(args.corDoLayout);

			var coluna23 = camposLaterais;
			pdf.moveTo(args.ajusteX + coluna23, args.ajusteY + linha21)
			    .lineTo(args.ajusteX + coluna23, args.ajusteY + linha211)
			    .stroke(args.corDoLayout);

			var coluna24 = 93.5;
			pdf.moveTo(args.ajusteX + coluna24, args.ajusteY + linha23)
			    .lineTo(args.ajusteX + coluna24, args.ajusteY + linha24)
			    .stroke(args.corDoLayout);

			var coluna25 = coluna24 + 92.5;
			pdf.moveTo(args.ajusteX + coluna25, args.ajusteY + linha23)
			    .lineTo(args.ajusteX + coluna25, args.ajusteY + linha24)
			    .stroke(args.corDoLayout);

			var coluna26 = coluna25 + 84.5;
			pdf.moveTo(args.ajusteX + coluna26, args.ajusteY + linha23)
			    .lineTo(args.ajusteX + coluna26, args.ajusteY + linha24)
			    .stroke(args.corDoLayout);

			var coluna27 = coluna26 + 61;
			pdf.moveTo(args.ajusteX + coluna27, args.ajusteY + linha23)
			    .lineTo(args.ajusteX + coluna27, args.ajusteY + linha24)
			    .stroke(args.corDoLayout);

			var coluna28 = margemDoSegundoBlocoLayout + 106;
			pdf.moveTo(args.ajusteX + coluna28, args.ajusteY + linha24)
			    .lineTo(args.ajusteX + coluna28, args.ajusteY + linha25)
			    .stroke(args.corDoLayout);

			var coluna29 = coluna28 + 76.5;
			pdf.moveTo(args.ajusteX + coluna29, args.ajusteY + linha24)
			    .lineTo(args.ajusteX + coluna29, args.ajusteY + linha25)
			    .stroke(args.corDoLayout);

			var coluna210 = coluna29 + 77;
			pdf.moveTo(args.ajusteX + coluna210, args.ajusteY + linha24)
			    .lineTo(args.ajusteX + coluna210, args.ajusteY + linha25)
			    .stroke(args.corDoLayout);

			var coluna211 = coluna210 + 92;
			pdf.moveTo(args.ajusteX + coluna211, args.ajusteY + linha24)
			    .lineTo(args.ajusteX + coluna211, args.ajusteY + linha25)
			    .stroke(args.corDoLayout);

			var coluna212 = 154;
			pdf.moveTo(args.ajusteX + coluna212, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna212, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var coluna213 = coluna212 + 1;
			pdf.moveTo(args.ajusteX + coluna213, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna213, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var coluna214 = coluna213 + 1;
			pdf.moveTo(args.ajusteX + coluna214, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna214, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var coluna215 = coluna214 + 41.5;
			pdf.moveTo(args.ajusteX + coluna215, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna215, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var coluna216 = coluna215 + 1;
			pdf.moveTo(args.ajusteX + coluna216, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna216, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var coluna217 = coluna216 + 1;
			pdf.moveTo(args.ajusteX + coluna217, args.ajusteY + 217.5)
			    .lineTo(args.ajusteX + coluna217, args.ajusteY + linha21)
			    .stroke(args.corDoLayout);

			var linhaSeparadora = 199;
			pdf.moveTo(args.ajusteX + 27, args.ajusteY + linhaSeparadora)
			    .lineTo(args.ajusteX + 572, args.ajusteY + linhaSeparadora)
			    .dash(3, { space: 5 })
			    .stroke(args.corDoLayout);

			var caminhoParaTesoura = path.join(__dirname, 'imagens/tesoura128.png');
			pdf.image(caminhoParaTesoura, args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + 195.7, {
				width: 10
			});

			///IMPRIMIR LAYOUT

			var banco = boleto.getBanco(),
				pagador = boleto.getPagador(),
				beneficiario = boleto.getBeneficiario(),
				datas = boleto.getDatas();

			args.creditos && pdf.font('italico')
				.fontSize(8)
				.text(args.creditos, args.ajusteX + 3, args.ajusteY + 90, {
					width: 560,
					align: 'center'
				});

			var zeroLinha = 105;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('BENEFICIÁRIO:', args.ajusteX + 27, args.ajusteY + zeroLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(beneficiario.getIdentificacao().toUpperCase(), args.ajusteX + 27, args.ajusteY + zeroLinha + args.tamanhoDaFonte + 1.5, {
					lineBreak: false,
					width: 545,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('RECIBO DO PAGADOR', args.ajusteX + 278, args.ajusteY + zeroLinha, {
					lineBreak: false,
					width: 294,
					align: 'right'
				});

			var primeiraLinha = 142,
				diferencaEntreTituloEValor = 10,
				tituloDaPrimeiraLinha = primeiraLinha - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Nome do Cliente', args.ajusteX + 32, args.ajusteY + tituloDaPrimeiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(pagador.getNome(), args.ajusteX + 32, args.ajusteY + primeiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Data de Vencimento', args.ajusteX + 332, args.ajusteY + tituloDaPrimeiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(datas.getVencimentoFormatado(), args.ajusteX + 332, args.ajusteY + primeiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Valor Cobrado', args.ajusteX + 424, args.ajusteY + tituloDaPrimeiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var segundaLinha = primeiraLinha + espacoEntreLinhas,
				tituloDaSegundaLinha = segundaLinha - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Agência / Código do Beneficiário', args.ajusteX + 32, args.ajusteY + tituloDaSegundaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(banco.getAgenciaECodigoBeneficiario(boleto), args.ajusteX + 32, args.ajusteY + segundaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Nosso Número', args.ajusteX + 181, args.ajusteY + tituloDaSegundaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(beneficiario.getNossoNumero(), args.ajusteX + 181, args.ajusteY + segundaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(7)
				.text('Autenticação Mecânica', args.ajusteX + 426, args.ajusteY + segundaLinha - 5, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var segundaLinha2 = segundaLinha + 56,
				codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
				linhaDigitavel = geradorDeLinhaDigitavel(codigoDeBarras, banco);

			var caminhoParaTesoura = path.join(__dirname, 'imagens/tesoura128.png');
			pdf.image(banco.getImagem(), args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + segundaLinha2 - 5, {
				height: 23
			});

			banco.getImprimirNome() && pdf.font('negrito')
				.fontSize(args.tamanhoDaLinhaDigitavel)
				.text(banco.getNome(), args.ajusteX + margemDoSegundoBlocoLayout + 26, args.ajusteY + segundaLinha2, {
					lineBreak: false,
					width: 100,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaLinhaDigitavel)
				.text(banco.getNumeroFormatadoComDigito(), args.ajusteX + margemDoSegundoBlocoLayout + 133.5, args.ajusteY + segundaLinha2, {
					lineBreak: false,
					width: 50,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaLinhaDigitavel)
				.text(linhaDigitavel, args.ajusteX + margemDoSegundoBlocoLayout + 145, args.ajusteY + segundaLinha2, {
					lineBreak: false,
					width: 400,
					align: 'right'
				});

			function i25(text) { //extrair para o gammautils
			    if(text.length % 2 !== 0) {
			        throw new Error('Text must have an even number of characters');
			    }

			    var start = String.fromCharCode(201),
			        stop = String.fromCharCode(202);

			    return text.match(/.{2}/g).reduce(function(acc, part){
			      var value = parseInt(part, 10),
			          ascii;

			      if(value >= 0 && value <= 93) {
			          ascii = value + 33;
			      }

			      if(value >= 94 && value <= 99) {
			          ascii = value + 101;
			      }

			      return acc + String.fromCharCode(ascii);
			    }, start) + stop;
			}

			pdf.font('codigoDeBarras')
				.fontSize(args.tamanhoDoCodigoDeBarras)
				.text(i25(codigoDeBarras), args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha212 + 3.5, {
					lineBreak: false,
					width: 310,
					align: 'left'
				});

			var terceiraLinha = segundaLinha + 95,
				tituloDaTerceiraLinha = terceiraLinha - diferencaEntreTituloEValor,
				tituloDaTerceiraLinhaLateral = terceiraLinha - diferencaEntreTituloEValor,
				colunaLateral = 440;

			var tituloLocalDoPagamento = margemDoSegundoBloco;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Local do Pagamento', args.ajusteX + tituloLocalDoPagamento, args.ajusteY + tituloDaTerceiraLinha - 7, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			boleto.getLocaisDePagamento().forEach(function(localDePagamento, indice) {
				if(indice > 1) {
					return;
				}

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(localDePagamento, args.ajusteX + margemDoSegundoBloco, args.ajusteY + (terceiraLinha + 2 - args.tamanhoDaFonte + (indice * args.tamanhoDaFonte)), {
						lineBreak: false,
						width: 400,
						align: 'left'
					});
			});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Vencimento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaTerceiraLinhaLateral - 7, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(datas.getVencimentoFormatado(), args.ajusteX + colunaLateral, args.ajusteY + terceiraLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var quartaLinha = terceiraLinha + 24,
				tituloDaQuartaLinhaLateral = quartaLinha - diferencaEntreTituloEValor;

			var tituloBeneficiario = margemDoSegundoBloco;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Beneficiário', args.ajusteX + tituloBeneficiario, args.ajusteY + tituloDaQuartaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(beneficiario.getIdentificacao(), args.ajusteX + margemDoSegundoBloco, args.ajusteY + quartaLinha, {
					lineBreak: false,
					width: 400,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Agência / Código do Beneficiário', args.ajusteX + colunaLateral, args.ajusteY + tituloDaQuartaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(banco.getAgenciaECodigoBeneficiario(boleto), args.ajusteX + colunaLateral, args.ajusteY + quartaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var quintaLinha = quartaLinha + espacoEntreLinhas,
				tituloDaQuintaLinha = quintaLinha - diferencaEntreTituloEValor,
				tituloDaQuintaLinhaLateral = quintaLinha - diferencaEntreTituloEValor;

			var tituloDataDocumento = margemDoSegundoBloco;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Data Documento', args.ajusteX + tituloDataDocumento, args.ajusteY + tituloDaQuintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(datas.getDocumentoFormatado(), args.ajusteX + margemDoSegundoBloco, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 61.5,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getNumeroDoDocumentoFormatado(), args.ajusteX + margemDoSegundoBloco + 68, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 84,
					align: 'left'
				});

			var tituloNumeroDoDocumento = tituloDataDocumento + 68;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Nº do Documento', args.ajusteX + tituloNumeroDoDocumento, args.ajusteY + tituloDaQuintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var tituloEspecieDoc = tituloNumeroDoDocumento + 90;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Espécie Doc.', args.ajusteX + tituloEspecieDoc, args.ajusteY + tituloDaQuintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getEspecieDocumento(), args.ajusteX + margemDoSegundoBloco + 68 + 90, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 81,
					align: 'center'
				});

			var tituloAceite = tituloEspecieDoc + 86;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Aceite', args.ajusteX + tituloAceite, args.ajusteY + tituloDaQuintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getAceiteFormatado(), args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 55,
					align: 'center'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(datas.getProcessamentoFormatado(), args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86 + 61.5, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 93.5,
					align: 'left'
				});

			var tituloDataProcessamento = tituloAceite + 61;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Data Processamento', args.ajusteX + tituloDataProcessamento, args.ajusteY + tituloDaQuintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Nosso Número / Cód. do Documento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaQuintaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(banco.getNossoNumeroECodigoDocumento(boleto), args.ajusteX + colunaLateral, args.ajusteY + quintaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var sextaLinha = quintaLinha + espacoEntreLinhas,
				tituloDaSextaLinha = sextaLinha - diferencaEntreTituloEValor;

			var tituloUsoDoBancoX = margemDoSegundoBloco;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Uso do Banco', args.ajusteX + tituloUsoDoBancoX, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var tituloCarteira = tituloUsoDoBancoX + 105;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Carteira', args.ajusteX + tituloCarteira, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(beneficiario.getCarteira(), args.ajusteX + margemDoSegundoBloco + 104.5, args.ajusteY + sextaLinha, {
					lineBreak: false,
					width: 71,
					align: 'center'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getEspecieMoeda(), args.ajusteX + margemDoSegundoBloco + 104.5 + 77, args.ajusteY + sextaLinha, {
					lineBreak: false,
					width: 71,
					align: 'center'
				});

			var tituloEspecieMoeda = tituloCarteira + 77;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Espécie Moeda', args.ajusteX + tituloEspecieMoeda, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var tituloQuantidadeMoeda = tituloEspecieMoeda + 77;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Quantidade Moeda', args.ajusteX + tituloQuantidadeMoeda, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var tituloValorMoeda = tituloQuantidadeMoeda + 92;
			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Valor Moeda', args.ajusteX + tituloValorMoeda, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(=) Valor do Documento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaSextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getValorFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + sextaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var setimaLinhaLateral = sextaLinha + espacoEntreLinhas,
				tituloDaSetimaLinha = tituloDaSextaLinha + espacoEntreLinhas,
				tituloDaSetimaLinhaLateral = setimaLinhaLateral - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Instruções', args.ajusteX + margemDoSegundoBloco, args.ajusteY + tituloDaSetimaLinha, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var instrucaoY = tituloDaSetimaLinha + 12;
			boleto.getInstrucoes().forEach(function(instrucao, indice) {
				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(instrucao, args.ajusteX + margemDoSegundoBloco, args.ajusteY + instrucaoY + (indice * args.tamanhoDaFonte), {
						lineBreak: false,
						width: 400,
						align: 'left'
					});
			});

			if(args.exibirCampoUnidadeBeneficiaria) {
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Unidade Beneficiária', args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 70, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
			}

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Pagador', args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(pagador.getIdentificacao(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10, {
					lineBreak: false,
					width: 535,
					align: 'left'
				});

			var enderecoDoPagador = pagador.getEndereco();
			if(enderecoDoPagador) {
				var espacamento = args.tamanhoDaFonte;

				if(enderecoDoPagador.getPrimeiraLinha()) {
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(enderecoDoPagador.getPrimeiraLinha(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento, {
							lineBreak: false,
							width: 535,
							align: 'left'
						});

					espacamento += espacamento;
				}

				if(enderecoDoPagador.getSegundaLinha()) {
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(enderecoDoPagador.getSegundaLinha(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento, {
							lineBreak: false,
							width: 535,
							align: 'left'
						});
				}
			}

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Código de Baixa', args.ajusteX + 370, args.ajusteY + tituloDaSetimaLinha + 159, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('Autenticação Mecânica', args.ajusteX + 360, args.ajusteY + tituloDaSetimaLinha + 171.5, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo + 1)
				.text('FICHA DE COMPENSAÇÃO', args.ajusteX + 421, args.ajusteY + tituloDaSetimaLinha + 171.5, {
					lineBreak: false,
					width: 150,
					align: 'right'
				});

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(-) Desconto / Abatimento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaSetimaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getValorDescontosFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + setimaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var oitavaLinhaLateral = setimaLinhaLateral + espacoEntreLinhas,
				tituloDaOitavaLinhaLateral = oitavaLinhaLateral - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(-) Outras Deduções', args.ajusteX + colunaLateral, args.ajusteY + tituloDaOitavaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			pdf.font('normal')
				.fontSize(args.tamanhoDaFonte)
				.text(boleto.getValorDeducoesFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + oitavaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var nonaLinhaLateral = oitavaLinhaLateral + espacoEntreLinhas,
				tituloDaNonaLinhaLateral = nonaLinhaLateral - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(+) Mora / Multa', args.ajusteX + colunaLateral, args.ajusteY + tituloDaNonaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var decimaLinhaLateral = nonaLinhaLateral + espacoEntreLinhas,
				tituloDaDecimaLinhaLateral = decimaLinhaLateral - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(+) Outros Acréscimos', args.ajusteX + colunaLateral, args.ajusteY + tituloDaDecimaLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			var decimaPrimLinhaLateral = decimaLinhaLateral + espacoEntreLinhas,
				tituloDaDecimaPrimLinhaLateral = decimaPrimLinhaLateral - diferencaEntreTituloEValor;

			pdf.font('negrito')
				.fontSize(args.tamanhoDaFonteDoTitulo)
				.text('(=) Valor Cobrado', args.ajusteX + colunaLateral, args.ajusteY + tituloDaDecimaPrimLinhaLateral, {
					lineBreak: false,
					width: 294,
					align: 'left'
				});

			// args.imprimirSequenciaDoBoleto && pdf.font('italico')
			// 	.fontSize(args.tamanhoDaFonte)
			// 	.text('Boleto Nº ' + (indice + 1) + '/' + boletos.length, args.ajusteX + 30, args.ajusteY + 10, {
			// 		width: 560,
			// 		align: 'center'
			// 	});

			if(indice < boletos.length - 1) {
				pdf.addPage();
			}
		})

		pdf.end();

		callback(null, pdf);
	}

	GeradorDeBoleto.prototype.gerarHTML = function() {

	}

	return GeradorDeBoleto;
})();

module.exports = GeradorDeBoleto;