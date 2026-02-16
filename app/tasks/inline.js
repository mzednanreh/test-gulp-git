/**
 * CSS INLINING
 *
 * Inlines project CSS files
 */
const { src: gulpSrc, dest, series } = require('gulp');

const fs = require('fs');
const siphon = require('siphon-media-query');
const merge = require('merge2');
const replace = require('gulp-replace');
const lazypipe = require('lazypipe');
const inline = require('gulp-inline-css');
const htmlmin = require('gulp-htmlmin');
const path = require('path');
let projectConfig = require('../../project.json');
const externalfonts = require('./external-fonts');

exports.inline = (project) =>
{
  let src           = './src/';
  let mainCss       = '/shared/css/main.css';
  let root          = path.join(__dirname, '../..') + '/src';

  function getMqCss(file)
  {
    var css = fs.readFileSync(root + file).toString();
    return siphon(css);
  }

  // Inliner
  function inliner(css)
  {
    var pipe = lazypipe()
      .pipe(inline, {
        applyStyleTags: false,
        removeStyleTags: false,
        preserveMediaQueries: true,
        removeLinkTags: true
      })
      .pipe(replace, '<!-- <style> -->', `${externalfonts.addInlineFonts()}<style type="text/css">${css}</style>`)
      .pipe(htmlmin, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: true, // CSS minification breaks responsive feature in Outlook Mobile app
        processConditionalComments: false
      })
      .pipe(replace, '}@media only screen{', '')
      .pipe(replace, /}}/, '}} ')
      .pipe(replace, /}@media[^{]+\{/g, '')
      .pipe(replace, /@media[^{]+\{/g, function handleReplace(match) {
        return match + ' ';
      })
      .pipe(replace, /<!--[^\\[<>].*?(?<!!)-->/gsm, ''); // remove HTML comments but not Outlook comments

    return pipe();
  }

  // Inline sass
  function inlineCss()
  {
    let stream = merge();

    project.keys.map( (email) =>
    {
      let path = src + email + '/';
      let html = email + '.html';
      const localCss = `/${email}/css/local.css`;

      const localMq = getMqCss(localCss);
      const mainMq = getMqCss(mainCss);

      stream.add(
        gulpSrc(path + html)
          .pipe(inliner(mainMq + localMq))
          .pipe(dest(path))
        );
    });

    return stream;
  }

  return inlineCss;
};
