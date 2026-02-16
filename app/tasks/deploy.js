/**
 * Deploy email to staging site
 *
 * Email is deployed to app/sbx/SITE.js with command `gulp deploy --sbx SITE`,
 * a index is used to see and download emails. Couple things to note:
 *
 * - Emails veiwed on the link use ABSOLUTE paths for easy testing (think litmus)
 * - Downloadable zip has RELATIVE paths, because this is what agency/client will
 *   use
 */

// dependencies
const { src: gulpSrc, dest } = require('gulp');

const fs = require('fs');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const replace = require('gulp-replace');
const merge = require('merge-stream');
const deployPather = require('../helpers/deploy-path.js');
const { removeFragmentsToken } = require('../helpers/fragments');
const git = require('gulp-git');

/* FTP helpers */

// Message to be relayed after completing upload
const completeMessage = (creds, deployPath) =>
{
  const loc = `${creds.loc}/${deployPath.join('/')}`;

  gutil.log(
    gutil.colors.cyan(`Upload complete! View email(s) at`),
    gutil.colors.blue.bold(`${loc}`)
  );

  updateStagingLog(loc);
};

// Update staging log file
const updateStagingLog = (stagingLink) => {
  const date = new Date();
  const today = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

  const stagingLogFile = `./staging-link.log`;

  const newLogEntry = `${today} - staging link: ${stagingLink}\n`;

  fs.appendFile(stagingLogFile, newLogEntry, (err) => {
    if (err) throw err;
    console.log('staging log file successfully updated!');
    commitStaginLog();
  });
};


const commitStaginLog = () => {
  const stagingLogFile = './staging-link.log';

  console.log('after deploy now commit log file 2');

  return gulpSrc(stagingLogFile)
    .pipe(git.add())
    .pipe(git.commit('update staging-link log file'))
    // .pipe(git.push('origin', function (err) {
    //   if (err) throw err;
    //   console.log('log file staging-link committed!');
    // }))
    ;
};


// Create a connection to server and overwrite
// default settings with provided ones
const connect = (creds, log, debug) =>
{
  let settings = {
    host:     creds.HOST,
    user:     creds.USER,
    password: creds.PASSWORD,
    log:      log,
    debug:    debug ? (text) => {debug.write(`${text}\n`);} : false,
    secure:   !true, /* make true before commit */
    secureOptions: { rejectUnauthorized: false }
  };

  // overwrite default settings with any provided in sbx
  if (creds.hasOwnProperty('settings'))
  {
    const keys = Object.keys(creds.settings);
    const prefs = creds.settings;

    keys.map((key) =>
    {
      gutil.log(gutil.colors.cyan(`custom setting for ${key} set to ${prefs[key]}`));
      settings[key] = prefs[key];
    });

  }

  // return FTP connect
  return ftp.create(settings);
};

exports.deploy = (project) =>
{
  const src   = './src/_build/';
  const deployPath = deployPather(project);
  const creds = project.creds;

  return {
    // Change email paths from relative to absolute
    // Remove {{insertEmailFragments}} token
    replace: () => {
      let stream = merge();
      const emails = project.keys;
      const deployDest = `${creds.loc}/${deployPath.join('/')}`;

      // no creds? no deploy
      if (creds === false)
        throw 'no creds provided, run again with --sbx [YOUR SBX]';

      emails.map( (email) =>
        {
          const emailSrc = `${src}/${email}/`;
          const imgDest = `${deployDest}/${email}/images`;

          const htmlStream = gulpSrc(`${emailSrc}index.html`)
            .pipe(replace(/src\=\"images/g, `src=\"${imgDest}`))
            .pipe(replace(/src\=\"images/g, `src=\'${imgDest}`))
            .pipe(replace(/url\(images/g, `url\(${imgDest}`))
            .pipe(replace(/url\(\'images/g, `url\('${imgDest}`))
            .pipe(replace(/url\(\"images/g, `url\("${imgDest}`))
            .pipe(replace(/background=\"images/g, `background="${imgDest}`))
            .pipe(replace(/background=\'images/g, `background='${imgDest}`))
            .pipe(removeFragmentsToken())
            .pipe(dest(emailSrc));

          stream.add(htmlStream);
        });

      return stream;
    },

    // Deploy email to passed in SBX
    sbx: () => {
      const debugLog = fs.createWriteStream('./app/sbxs/full-log.txt');
      const conn = connect(creds, gutil.log);
      const deployDir = `${creds.dir}/${deployPath.join('/')}`;
      const deploy = () => {
        return gulpSrc(`${src}**`)
          .pipe( conn.differentSize(deployDir))
          .pipe( conn.dest(deployDir));
      };

      // deploy twice checking size,
      // twice because script sadly drops files, looks to be vinyl-ftp issue
      return deploy()
        // Output done message w/ URL
        .on('end', () => {
          setTimeout(() => {
            deploy().on('end', () => {
              completeMessage(creds, deployPath);
              // commitStaginLog();
            });
          }, 3000);
        });
    },

    // commit staging log file
    // commitStaginLog: () => {
    //   const stagingLogFile = ['./staging-link.log'];

    //   console.log('after deploy now commit log file');

    //   return gulpSrc(stagingLogFile)
    //     .pipe(git.add())
    //     // .pipe(git.commit('update staging-link log file'))
    //     // .pipe(git.push('origin', function (err) {
    //     //   if (err) throw err;
    //     //   console.log('log file staging-link committed!');
    //     // }))
    //     ;
    // },
  };
};
