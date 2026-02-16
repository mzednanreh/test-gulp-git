/**
* SETUP FOR A NEW PROJECT
*
* Scaffold builds sass & html for new projects.
*
* For new projects:
*
* Fill out ./emails.json with emails in project and set project
* information in ./project.json
*
* Then run `gulp scaffold:clean` to delete example code, followed by
* `gulp scaffold` to create sass and html for emails.
*
* To update an existing project:
*
* If new emails need to be added to an existing project, first add them
* to emails.json, then run `gulp scaffold`. It wont overwrite old emails.
*
* To delete an email remove it from email.json and run
* `gulp scaffold:clean` and it will delete the files and folders
* associated with it, leaving others intact.
*
* Default email HTML created from scaffolding can be customized
* by editng app/templates/htmlPage.tpl
*/

const { series } = require('gulp');

const fs = require('fs');
const del = require('del');
const argv = require('yargs').argv;

require('gulp-util');
require('path');

exports.scaffold = (project) =>
{
  const htmlPagesPath = './resources/html/';
  const sassPagesPath = './resources/sass/';
  const templatePath = './app/templates/';
  const overwriteFlag = Boolean(argv['overwrite']);
  const emails = project.keys;

  let Templater = function (filePath)
  {
    let nameTag = new RegExp('<%fileName%>', 'g');
    let tpl = fs.readFileSync(filePath, 'utf8');

    this.setFileName = (name) =>
    {
      tpl = tpl.replace(nameTag, name);
    };

    this.get = () =>
    {
      return tpl;
    };
  };

  let tryMkDir = (path) =>
  {
    try
    {
      fs.mkdirSync(path);
    }
    catch (e)
    {
      if (e.code != 'EEXIST') throw e;
    }
  };

  let createPages = (templatePath, resourcesPath, extension) =>
  {
    let path, template, name;

    for (let index in project.keys)
    {
      name = project.keys[index];
      path = resourcesPath+'emails/'+name+extension;

      template = new Templater(templatePath);
      template.setFileName(name);

      if ( ! fs.existsSync(path) || overwriteFlag)
        fs.writeFileSync(path, template.get());
    }
  };

  let createFragments = () => {
    for (const email of emails) {
      const fragments = project.emails[email].fragments;

      if ( !fragments || !fragments.length ) {
        continue;
      }

      for (const fragment of fragments) {
        const path = `${htmlPagesPath}fragments/${email}/${fragment}.html`;
        const template = new Templater(`${templatePath}htmlFragment.tpl`);

        template.setFileName(fragment);

        tryMkDir(`${htmlPagesPath}/fragments/${email}`);

        if ( !fs.existsSync(path) || overwriteFlag ) {
          fs.writeFileSync(path, template.get());
        }
      }
    }
  };

  const styles = (cb) =>
  {
    createPages(templatePath+'sassPage.tpl', sassPagesPath, '.scss');

    // load device by argv path
    let device = argv['device'];
    if (device)
    {
      let deviceStyles = new Templater(templatePath+'/devices/scss/'+device+'-scss.tpl');
      fs.writeFileSync(sassPagesPath+'partials/_device.scss', deviceStyles.get());
    }

    cb();
  };

  const html = (cb) =>
  {
    createPages(templatePath+'htmlPage.tpl', htmlPagesPath, '.html');
    createFragments();

    let path = './src/';
    for (let index in project.keys)
    {
      const name = project.keys[index];

      tryMkDir(path+name);
      tryMkDir(path+name+'/images');
    }

    cb();
  };

  const clean = () =>
  {
    let paths = [
      './src/**',
      '!./src',
      '!./src/index.php',
      '!./src/router.php',
      '!./src/no-thumb.png',
      '!./src/index.html',
      '!./src/emails.json',
      '!**/.keep',
      '!./src/shared',
      '!./src/shared/**',
      'resources/html/emails/**',
      '!resources/html/emails',
      'resources/html/fragments/**',
      '!resources/html/fragments',
      'resources/sass/emails/**',
      '!resources/sass/emails',
      // example code
      '**/example_*',
      'resources/sass/example'
    ];

    for (const email of emails) {
      const fragments = project.emails[email].fragments;

      paths = paths.concat([
        `!./src/${email}/**`,
        `!resources/html/emails/${email}.html`,
        `!resources/sass/emails/${email}.scss`,
      ]);

      if ( !fragments || !fragments.length ) {
        continue;
      }

      for (const fragment of fragments) {
        const fragmentFolder = `!resources/html/fragments/${email}`;

        if ( !paths.includes(fragmentFolder) ) {
          paths.push(fragmentFolder);
        }

        paths.push(`!resources/html/fragments/${email}/${fragment}.html`);
      }
    }

    // remove SASS example files include
    let mainscss = fs.readFileSync('resources/sass/main.scss', 'utf8');
    mainscss = mainscss.replace(/\/\*EXAMPLE\*\/\n(.*\n)*\/\*EXAMPLE\*\//, '');
    fs.writeFileSync('resources/sass/main.scss', mainscss);

    return del(paths);
  };

  /*
   * Write out src/emails.json so index can view KMs
   */
  function emailsJson(cb) {
    const emailsArr = [];

    for (const email of emails)
    {
      emailsArr.push({
        'name': `${email}`,
        'href': `${email}/${email}.html`,
      });
    }

    fs.writeFileSync('src/emails.json', 'const emails = ' + JSON.stringify(emailsArr));
    cb();
  };

  return { all: series(styles, html, emailsJson), clean }
};
