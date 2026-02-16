/**
 * Package emails & assets (imgs) into contained directory
 *
 * Process merges shared assets of email into one folder, src/_build,
 * also generates date stamped ZIP of assets. Index created for easy viewing.
 *
 * CSS is inlined, images are all relative. (For absolute paths deploy it)
 */

// dependencies
const { src: gulpSrc, dest } = require('gulp');

const zip = require('gulp-zip');
const merge = require('merge-stream');
const deployPather = require('../helpers/deploy-path.js');
const del = require('del');
const fs = require('fs');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const { pullFragments, removeFragmentsToken, removeFragments } = require('../helpers/fragments');
const fixDoctype = require('../helpers/fix-doctype');
const gulpif = require('gulp-if');
const flatmap = require('gulp-flatmap');


exports.build = (project) =>
{
  const buildDest = './src/_build/';
  const projectEmails = project.keys;
  const stamp = deployPather(project).reverse().join('-');


  // Remove everything from build
  const clean = () =>
  {
    const stream = merge();

    del(buildDest)
      .then(() =>
          {
            fs.mkdirSync(buildDest);
            stream.end();
          });

    return stream;
  };


  // Create index in build with relative paths to view emails/zips
  const index = () =>
  {
    const stream = merge();
    const meta = project.meta;
    let emailList = '';
    let index = '';

    projectEmails.map((email) =>
      {
        emailList += `\t\t<li><a href=\"./${email}/index.html\">${email}</a></li>\n`;
      });

    // with all the pieces, make index
    index = `<!doctype HTML><html><head><title>${meta.name}</title></head>
              <body>
              <h2>${meta.product} - ${meta.name}</h2>
              <h3>Emails</h3>
              <ul>\n${emailList}\n</ul>
              <h3>Zip</h3>
              <p><a href="./${stamp}.zip">project zip</a></p>
            \n</body></html>`;

    // write index to build dest, end stream when finished
    fs.writeFile(`${buildDest}index.html`, index, () => stream.end());

    return stream;
  };


  // create relative pathed emails
  const emails = () =>
  {
    let stream = merge();
    const IMG_EXTENSION = '*.{png,svg,gif,jpg,jpeg}';
    let imgPathRegex = /\.\.\/shared\//g;
    const imgPath = project.meta.hasOwnProperty('image_path')
      ? project.meta.image_path
      : '';

    if (imgPath) {
      imgPathRegex = /\.\.\/shared\/images\/|images\//g;
    }

    // for each email
    projectEmails.map((email) =>
      {
        let imgStream, htmlStream;

        // move images (implicitly make directory)
        imgStream = gulpSrc([
            `src/shared/images/${IMG_EXTENSION}`,
            `src/${email}/images/${IMG_EXTENSION}`
            ])
          .pipe(imagemin())
          .pipe(dest(`${buildDest}/${email}/images`));

        // move HTML over to _build, rename to index,
        // removed shared folder references
        htmlStream = gulpSrc(`src/${email}/${email}.html`)
          .pipe(replace(imgPathRegex, imgPath))
          .pipe(rename('index.html'))
          .pipe(dest(`${buildDest}/${email}/`));

        stream.add(htmlStream);
        stream.add(imgStream);
      });

    return stream;
  };


  // Pull out fragments from emails and save as separate files
  const fragments = () =>
  {
    const stream = merge();

    projectEmails.map((email) => {
      const src = `${buildDest}/${email}/`;

      stream.add(
        gulpSrc(`${src}index.html`)
          .pipe(pullFragments(src))
          .pipe(dest(src))
      );
    });

    return stream;
  };


  // Make a zip
  // Before that remove fragments from emails
  // and update image paths
  const zips = () =>
  {
    let streamZIPs = merge();

    projectStream = zipHelper([`${buildDest}\*\*`, `!${buildDest}/index.html`], buildDest, stamp);

    eachEmailStream = gulpSrc([
      `${buildDest}\*`,
      `!${buildDest}/index.html`
    ])
      .pipe(flatmap(function (stream, file){
        var fileName = file.basename;

        return zipHelper([`${buildDest+fileName}/**/*`], buildDest, fileName);
      }));

    streamZIPs.add(projectStream);
    streamZIPs.add(eachEmailStream);

    return streamZIPs;
  };

  const zipHelper = (srcPath, destPath, zipName) => {
    const imgPath = project.meta.hasOwnProperty('image_path')
      ? project.meta.image_path
      : null;

    return gulpSrc(srcPath)
      .pipe(gulpif(!!imgPath, replace(/src\=\"images\//g, `src=\"${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/src\=\"images\//g, `src=\'${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/url\(images\//g, `url\(${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/url\(\'images\//g, `url\('${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/url\(\"images\//g, `url\("${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/background=\"images\//g, `background="${imgPath}`)))
      .pipe(gulpif(!!imgPath, replace(/background=\'images\//g, `background='${imgPath}`)))
      .pipe(gulpif(/index.html$/, removeFragments()))
      .pipe(gulpif(/index.html$/, fixDoctype()))
      .pipe(zip(`${zipName}.zip`))
      .pipe(dest(destPath));
  };

  // Remove fragments from emails
  const removeEmailFragments = () =>
  {
    return gulpSrc([
      `${buildDest}\*\*/index.html`,
      `!${buildDest}/index.html`
    ], { base: './' })
      .pipe(removeFragments())
      .pipe(fixDoctype())
      .pipe(dest('.'))
  };


  // Remove {{insertEmailFragments}} token
  // All included fragments will be displayed in email
  const removeToken = () =>
  {
    return gulpSrc([
      `${buildDest}\*\*/index.html`,
      `!${buildDest}/index.html`
    ], { base: './' })
      .pipe(removeFragmentsToken())
      .pipe(dest('.'));
  };


  // Make a zip with emails and included fragments and without token
  const vae = () =>
  {
    return gulpSrc([
      `${buildDest}\*\*`,
      `!${buildDest}/index.html`
    ])
      .pipe(zip(`${stamp}.zip`))
      .pipe(dest(buildDest));
  };

  const createJSON = () =>
  {
    const stream = merge();
    const meta = project.meta;

    json = `{\n  "name": "${meta.name}",\n  "product": "${meta.product}",\n  "agency": "${meta.agency}",\n  "isVAE": ${meta.isVAE}\n}`;

    fs.writeFile(`${buildDest}project.json`, json, () => stream.end());

    return stream;
  };

  return {
    clean,
    index,
    emails,
    fragments,
    zips,
    removeEmailFragments,
    removeToken,
    vae,
    zipHelper,
    createJSON,
  };
};
