var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var PDFImage = require('pdf-image').PDFImage;

var source = path.join(__dirname, 'boleto-pan.pdf');

var pdfImage = new PDFImage(source);

pdfImage.convertPage(0).then(function (imagePath) {
  console.log(imagePath);
  fs.existsSync(imagePath);
}).catch(function(err){
  console.log(err);
});

var gs = ['/usr/bin/gs',
          '-dQUIET',
          '-dPARANOIDSAFER',
          '-dBATCH',
          '-dNOPAUSE',
          '-dNOPROMPT',
          '-dDOINTERPOLATE',
          '-sDEVICE=jpeg',
          '-dJPEGQ=100',
          '-dTextAlphaBits=4',
          '-dGraphicsAlphaBits=4',
          '-r300 -dFirstPage=1 -dLastPage=1',
          '-sOutputFile=' + path.join(__dirname, 'boleto-pan-gs.jpg'),
          source].join(' ');

console.log('TRACE:', gs);

exec(gs, function (error, stdout, stderr) {
    
  if ( error !== null ) {
    console.log(error);
  }else
    console.log('file created');
});

//var spindrift = require('spindrift');
//var pdf = spindrift(source);
//pdf.pngStream(300).pipe(fs.createWriteStream('out-page1.png'));