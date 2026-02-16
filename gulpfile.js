/**
 * All gulp tasks are stored in app/tasks.
 *
 * To learn more about each task read the documentation at the header of each
 * task file.
 */
const { series, watch, parallel, src } = require('gulp');
const connect = require('gulp-connect');

const { html, styles, scaffold, inline, build, deploy, server } = require('./app/tasks/');

/*
 * SERVER
 */
const runServer = server(connect);
// const stopServer = (cb) => { connect.serverClose(); cb(); };

const buildAll = series(
  build.clean,
  build.index,
  styles,
  html,
  inline,
  build.emails
);

const zips = series(
  buildAll,
  build.fragments,
  build.zips
);

/*
 * COMMANDS
 */
exports.html = html;
exports.styles = styles;
exports.scaffold = scaffold.all;
exports['scaffold:clean'] = scaffold.clean;
exports.inline = series(html, inline);
exports['inline:sass'] = series(styles, html, inline);
exports.build = series(zips, build.removeEmailFragments);
exports['build:vae'] = series(buildAll, build.removeToken, build.vae);
exports.deploy = series(zips, deploy.replace, deploy.sbx);
exports.zips = zips;
exports.clean = build.clean;

/*
 * WATCH & SERVE
 */
exports['watch:build'] = parallel(runServer, () => {
  watch(['./resources/**/*.html'], { ignoreInitial: false, queue: true }, html);
  watch(['./resources/**/*.scss', './resources/**/*.css'], { ignoreInitial: false, queue: true }, styles);
  watch(['./src/**/main.css', './src/**/local.css'], { ignoreInitial: false, queue: true }, series(html, inline));

  // Live reload
  watch('./src').on('change',
    (filepath) => src(filepath, { read: false }).pipe(connect.reload())
  );
});

exports.default = parallel(runServer, () => {
  watch('./resources/**/*.html', { ignoreInitial: false }, html);
  watch(['./resources/**/*.scss', './resources/**/*.css'], { ignoreInitial: false }, styles);

  // Live reload
  watch('./src').on('change',
    (filepath) => src(filepath, { read: false }).pipe(connect.reload())
  );
});