Lutece Emails
=============

Gulp framework for building emails with [Zurb Foundation for emails 2.4](https://github.com/foundation/foundation-emails-template/tree/v2.4.0)'s engine.

This project requires NodeJS 16.0, NPM, PHP, and Gulp installed and available on your system.

New project
===========

If you are creating a new email project from scratch follow these steps

1. Make sure you have the following installed and working: NodeJS 10.X, PHP 7.X where the command php -S localhost works in your terminal and gulp
2. Edit the [email.json](http://gitlab.envivent.com/envivent/lutece-emails/blob/master/emails.json) file to remove example emails and add yours
3. Run `gulp scaffold` to set up necessary files for your project
4. Run `npm start` to serve the project for development locally, you should see an index of your email(s) at `localhost:8080`
5. To build your project for hand off or testing run `npm run build`

Existing project
================

If you've cloned an existing project and want to build it for hand off, within repo run:

    npm install

To build compiled emails run

    npm run build

A link to view compiled emails and downloads are available at `src/_build/index.html`, to generate absolutely pathed emails read deploy instructions below.

Be mindful of any errors, if something seems particularly off email jbomber@envivent.com.

Commands
========

After installation and setup use the following commands:

* `npm start` - dev view at `localhost:8080` has sourcemaps & unminified html
* `npm run start:build` - build view at `localhost:8080` production compiled code, useful for pernicious bugs & final checks
* `gulp build` - makes zips available at `src/_build`
* `gulp scaffold` - read more about this below
* `gulp deploy --sbx MYSBX* deploys email project to given server, read more below


Scaffolding
===========

Many email projects have multiple emails built on the same template or which reuse many components, scaffolding creates necessary SCSS and HTML files and folders to simplify development. Before starting a project, or when adding new emails to an existing one, follow the below steps

1. Fill out `project.json` with product (or client) name and project, this will be used for generated path of project.
2. Enter all emails in `./emails.json` following existing format. Email specific variables can be added to this folder, and will be available as variables within the email
3. (optional) run `gulp scaffold:clean` to remove example content from project
4. run `gulp scaffold` to create layout for project

Once complete run `npm start` and go to `localhost:8080`, you will see a link to empty emails.


Fragments
=========

To assist with Vault fragments Lutece Emails automates inlining them for preview, and extracting them for upload to Vault.

Setup
-----

In `emails.json` add fragments to the email

    "xyz-meeting": {
      "subject": "Lets meet up",
      "preHeader": "",
      "fragments": [
        "fragment-1",
        "fragment-2"
      ]
    },

Then run scaffolding to generate fragments

    gulp scaffold

Finally, add your fragment to your email

    {% block content %}

    [...]

    {% raw %} {{insertEmailFragments[1,1]}} {% endraw %}
    {% include "xyz-meeting/fragment-1.html" ignore missing %}

    {% endblock %}

This fragment would be located in `resources/html/fragments/xyz-meeting/fragment-1.html`.

Best Practices
--------------

**Small File Size**

Going forward we will try and be more mindful of email size. The general rule is "be less than 100kb" because:
- higher KB's can lead emails to be flagged as spam, 100kb is about the cut off
- gmail (and probably others) have "view rest of email online" button which isn't ideal
- Veeva has it's own cut off around 120kb where emails actually get trimmed and broken

To achieve the framework has had some changes made to minify email size by default, there are coding change for this and some general advice to keep emails small:

<<<<<<< HEAD
- Tables are still very important in emails but try to use as few as possible. If you can get away with a `<p>` tag that's great. For text, which makes up most of an email, try to reduce the wrapping around to the bare bones. A single table or `<p>` would be ideal (if you can work with the spacing).
- When using conditionals comments of HTML for Outlook the close comment shouldn't have spaces:
  - YES `<!--<![endif]-->`
  - NO `<!-- <![endif] -->`
- If a vertical space is global (same size for desktop and mobile) use `<p>` and if it is different use `<p>` for Desktop and `<spacer>` for mobile, with the macro spacer.html that I updated should be enough but just in case, If they want to use it manually the `<p>` should have this style "mso-line-height-rule: exactly;" to work in Outlook
=======
- Tables are still very important in emails but try to use as few as possible. If you can get away with a \<p> tag that's great. For text, which makes up most of an email, try to reduce the wrapping around to the bare bones. A single table or \<p> would be ideal (if you can work with the spacing).
- When using conditionals comments of HTML for Outlook the close comment shouldn't have spaces:
  - YES `<!--<![endif]-->`
  - NO `<!-- <![endif] -->`
- If a vertical space is global (same size for desktop and mobile) use \<p> and if it is different use \<p> for Desktop and \<spacer> for mobile, with the macro spacer.html that I updated should be enough but just in case, If they want to use it manually the \<p> should have this style "mso-line-height-rule: exactly;" to work in Outlook
>>>>>>> origin/feature-updates-2025

**Good alt tags**

All images provided by the agency should have a good alt tag for screen reader support. If alt tags are missed they can break some email clients (this happened once a few years back) so for custom bullets just put something, it's less important though.

**Prevent email codes from becoming hyperlinks**

Clients, mobile and outlook in particular, can turn any collection of numbers into a telephone link automatically. Adding \&zwnj; and other techniques can prevent this.

VAE HTML minification
---------------------

VAE's have a strict file size limit of about 124kb, after that the bottom of emails can start to be truncated and "missing." In order to address this we have a new setting in `./project.json`.

```
{
  [...]
  "isVAE": true,
}
```

Change deployed image path
--------------------------

Some clients require email images to be hosted on an external website, which requires manually updating image paths, potentially multiple times during revisions. To accommodate this there is a new field in `project.json` *`image_path`*.

```
{
  "name": "live-text-background-image",
  "product": "xyz",
  "image_path": "https://example.com/test-email/images/",
  [...]
}
```

When this field exists it changes the path in *ZIP folder* and nowhere else. So if you want to confirm deployed images you must build the ZIP and should check before handing off.

Tasks
-----

* `gulp build` for hand off - removes fragments, placed in build folder as separate HTML files
* `gulp build:fragments` for preview - keeps fragments in email for testing
* `gulp deploy --sbx ENVIRONMENT` previews in browser have fragments within them, but ZIP download has separated fragments


Deploy
======

Lutece allows for email deployment to servers listed in `app/sbx/`.

To setup for deployment:

1. Make a copy of `./app/sbx/example.json` name it after your deploy location, in this example we'll name it `SERVER.json`
2. Fill out information in `SERVER.json`. USER/PASSWORD/HOST should be self explanatory for your server. `"dir"` is where folder in server where emails will get deployed and `"loc"` is the base url of emails once deployed.
3. Deploy email with `gulp deploy --sbx SERVER` where `SERVER` is the name of your JSON file

Read what is logged from deploy script, the final URL of your hosted project will appear in terminal/bash. Deployed webpage has

* Links to review each email online with ABSOLUTE image paths, so you can easily copy and paste source into litmus
* A link to download zip of emails which has RELATIVE image paths used to hand off project to clients


HTML
====

Project setup is similar to CLM Base while supporting (Zurb Foundation for Emails templating components)[https://foundation.zurb.com/emails/docs/inky.html].

Key points

* Images should be placed either within
  * src/email-name for images specific to one email
  * shared/images, for images used in multiple emails
* Variables in `emails.json` are available to use in HTML as {{ variable }}
* Escape Veeva tokens with `{% raw %} {{myToken}}  {% endraw %}`


SCSS
====

Styling roughly mimics The Sass Way used in CLM Base and Zurb Inky default CSS. Below are key locations

* `./resources/sass/config` has configuration for zurb inky variables
* `/resources/sass/partials/` styles used across all emails
	* `layout.scss` based layout styles
	* `XXX.scss` any other modularity you want to project for globally used styles
* `/resources/sass/emails/[my-email].scss` styles specific to each email


Images
======

**Any image over 500kb won't show up in browser,** by default. Make sure so compress an minimize images!

To allow specific assets to go above the threshold add them to `./file-size-limits.json`.

To change the path of the images (example for an online path) add it to the `./project.json`

```
{
  [...],
  "image_path": "new_path_here/"
}
```

External Fonts
==============

To add fonts from Google Fonts, add an array of **"fonts"** used in the project, with each font containing 3 properties, **used:** whether the font was used or not, **font:** name of the font and **settings:** the configuration to be imported

```
{
  "name": "live-text-background-image",
  "product": "xyz",
  "fonts": [
    {
      "used": true,
      "font": "Roboto",
      "settings":  "ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    },
    {
      "used": false,
      "font": "Open Sans",
      "settings":  "ital,wght@0,300..800;1,300..800&display=swap"
    }
   ],
   [...]
}
```


Next steps
==========

Read up on [SCSS](http://thesassway.com/beginner/how-to-structure-a-sass-project) and [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/templating.html)

