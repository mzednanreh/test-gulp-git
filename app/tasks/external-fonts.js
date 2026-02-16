const { src, dest } = require('gulp');
const lazypipe = require('lazypipe');
const replace = require('gulp-replace');
let projectConfig = require('../../project.json');

let htmlImport = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    `;
let usingExternalFonts = false;
let UsedFonts = [];
let save = true;


/* 
* check if any font is being used 
* or if the fonts array exists in the project.json file
*/
function checkIfUsedExternalFonts () {
  if (projectConfig.hasOwnProperty('fonts')) {
    projectConfig.fonts.forEach((element) => {
      if (element.hasOwnProperty('used') && element.used) {
        if (element.hasOwnProperty('font') && element.hasOwnProperty('settings')) {
          usingExternalFonts = true;
          if (save) UsedFonts.push(element);
        }
      }
    });
    save = false;
  }

  return usingExternalFonts;
}

function prepareFonts () {
  let fonts = '';

  // Check that Font names and Settings are correct
  UsedFonts.forEach((element) => {
    if (element.used) {
      let fontName = element.font.replace(' ', '+');
      let fontSettings = element.settings.replace('&display=swap', '');

      fonts += 'family=' + fontName + ((fontSettings) ? ':' + fontSettings : '') + '&';
    }
  });

  fonts += 'display=swap';
  
  return fonts;
}

/* 
* This function add the <link> imports of google fonts in the HTML File
* generated in app/tasks/html.js
* <link rel="preconnect" href="https://fonts.googleapis.com">
* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
*
* it also add the <link> for the font family imported, 
* for it to work in the local development
*
* <link href="https://fonts.googleapis.com/css2?family=Font+Name&display=swap" rel="stylesheet">
*/
function addHtmlImport () {
  let allFontsHtmlImport = '';

  if (checkIfUsedExternalFonts()) {
    allFontsHtmlImport = htmlImport + getLinkFonts();
  }

  var addFonts = lazypipe()
    .pipe(replace, '<!-- <ExternalFonts> -->', allFontsHtmlImport);

  return addFonts();
}

function addInlineFonts() {
  return (checkIfUsedExternalFonts()) ? getLinkFonts() : '';
}

function getLinkFonts () {
  return `<link href="https://fonts.googleapis.com/css2?${prepareFonts()}" rel="stylesheet">`;
}

exports.addHtmlImport = addHtmlImport;
exports.addInlineFonts = addInlineFonts;
