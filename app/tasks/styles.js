/**
 * SASS COMPILATION
 *
 * Turns resources/sass into CSS for emails. Two destinations for sass,
 * one is shared/css/main.css which should be the bulk of your CSS,
 * and includes Zurb's Inky sass.
 *
 * Email specific styles can be placed in
 * resources/sass/email/my-email.scss
 *
 * Devs can use their own SCSS organization but layout is set up
 * following The Sass Way,
 * http://thesassway.com/beginner/how-to-structure-a-sass-project
 *
 * Overview of structure is:
 * config/  - Zurb inky configuration, set width and such
 * modules/ - Sass code that doesn't directly output CSS
 *            For example _colors.scss, _fonts.scss, & _animations.scss
 * partials/ - Where most stuff happens, module specific scss files
 *             For example _nav.scss, _footer.scss, & _layout.scss
 * vendor/ - third-party files, like normalize, iscroll, etc
 *
 */

const { src, dest, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const sassVars = require('gulp-sass-vars');

require('gulp-concat');

exports.styles = () =>
{
  const sassFolder    = './resources/sass';
  const mainSassFile  = sassFolder + '/main.scss';
  const pageSassFiles = sassFolder + '/emails/*';
  const shared        = 'src/shared/';
  const cssDest       = shared + 'css';
  const projectConfig = require('../../project.json');

  const sassBase = (styleSrc) =>
  {
    return src(styleSrc)
      .pipe(sassVars({ isVAE: projectConfig.isVAE }, { verbose: true }))
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: ['sass', 'node_modules/foundation-for-vaes/scss']
      }).on('error', sass.logError))
  };

  const mainSass = () =>
  {
    return sassBase(mainSassFile)
      .pipe(sourcemaps.write())
      .pipe(dest(cssDest));
  };

  const pageSass = () =>
  {
    return sassBase(pageSassFiles)
      .pipe(rename( (path) =>
      {
        path.dirname = path.basename + '/css/';
        path.basename = 'local';
      }))
      .pipe(dest('src'));
  };

  return parallel(mainSass, pageSass);
};
