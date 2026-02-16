/**
 * NUNJUCKS HTML TEMPLATING
 *
 * Nunjucks (mozilla's js jinja2) is used for HTML templating followed
 * but Zurb's inky for building tables. All html is compiled from the
 * resources/html directory.
 *
 * HTML file for each email is generated from resources/html/email.
 *
 * To learn about nunjucks rendering refer to their documentation:
 * https://mozilla.github.io/nunjucks/templating.html
 */

const { src, dest } = require('gulp');

const nunjucksRender = require('gulp-nunjucks-render');
const inky = require('inky-for-vaes');
const data = require('gulp-data');
const { removeFragmentsToken } = require('../helpers/fragments');
const gulpif = require('gulp-if');
const externalfonts = require('./external-fonts');

require('gulp-util');

exports.html = (project) =>
{
  const htmlLoc       = './resources/html/';
  const htmlTpls      = htmlLoc + 'templates/';
  const htmlPartials  = htmlLoc + 'partials/';
  const htmlMarcos    = htmlLoc + 'macros/';
  const htmlFragments = htmlLoc + 'fragments/';
  const htmlPages     = htmlLoc + 'emails/**/*.+(html|nunjucks)';
  const htmlDest      = 'src';

  const makeData = (file) =>
  {
    let name = file.relative.replace(/\.[^/.]+$/, '');

    if(project.emails.hasOwnProperty(name))
      return project.emails[name];

    else
      return {};
  };

  const setDest = (file) =>
  {
    let fileName = file.relative;

    fileName = '/' + fileName.replace(/\.[^/.]+$/, '');

    return htmlDest + fileName;
  };

  const html = () => {
    const isDevEnv = process.env.NODE_ENV === 'dev';

    nunjucksRender.nunjucks.configure([htmlTpls, htmlPartials, htmlMarcos, htmlFragments]);

    return src(htmlPages)
      .pipe(data(makeData))
      .pipe(nunjucksRender({path: '../../src'}))
      .pipe(inky())
      .pipe(gulpif(isDevEnv, removeFragmentsToken()))
      .pipe(externalfonts.addHtmlImport())
      .pipe(dest(setDest));
  };

  return html;
};
