# Changelog
All notable changes to this project will be documented in this file.

## [2.2.0] (2025-09-26)

### Added
- Added new macros: `image.html` and `button.html`
- Added `image_path` to `/project.json` allowing the path of images in built email ZIPs to be updated 

### Changed
- Replaced PHP server with LiveReload server
- Split `_template.scss` into logical parts: `_layout.scss` and `_typography.scss`
- Updated spacer macro

## [2.1.0] (2024-07-11)

### Added
- Further reduced file size
- New way to include external fonts in `emails.json` to prevent developer mistakes
- Added best practices to readme.md

### Changed
- Changed display from CLM based to emails, with previews of emails using iframes
- Moved all examples to one email to prevent clutter

## [2.0.0] (2024-01-18)

### Added
- Command to reduce generated email file size. This is necessary for longer VAE's as Veeva truncates emails after ~124kb.
- New option in `project.json` to change image locations in built ZIP emails. This facilitates for when client's need us to host email images on a website.

### Changed
- Switched to GulpJS version 4
- Minmum version of NodeJS is now v16, up from 10
- Switched to Foundation 2.4


## [1.3.2] (2021-07-29)

### Added
- Added email example of difficult/hard features

## [1.3.1] (2021-03-22)

### Fixed
- `gulp deploy` now rewrites a greater variety of image paths from relative to absolute on deploy.

## [1.3.0] (2021-03-22)

### Added
- Automate vault fragment separation and previews

### Fixed
- Updated `gulp-ftp` module
- Fixed mimetype error in server

## [1.2.0] (2020-03-19)

### Fixed
- Media queires from local CSS files get pulled in
- Added in Igor's fixes for Outlook

## [1.1.0] (2019-03-07)

### Changed
- Email.json provides blank pre-headers as a guide to devs
- FTP deploy failure outputs warning message instead of duplicate email deploy location
- Rewrote build/deploy and output structure of emails
  - `gulp build` only gives relative emails and relative ZIP, absolute was taken away as it
     only works after deploying
  - `gulp deploy ...` changes build images paths from relative to absolute, so once deployed
    images are absolute and copy-able to litmus for testing
  - ZIP file on hosted website is STILL RELATIVE, as that is what agency's use for hand off

### Fixed
- Added select overflow fix from ZURB repo
- vinyl-ftp occasionally uploaded 0kb files, unfortunately this isn't 100% fixed but...
  - problem isolated to vinyl-ftp script, OC server logs and vinyl-ftp say 0kb images are uploaded fine
  - **fix** server attempts to upload files twice, each time only uploading files of different size
  - **if image appears broken even after two uploads attempt again and it will resolve**
- Absolute deploy
  - CSS background URL's deploy correctly

## [1.0.1a] (2019-02-14)

### Changed
- Deploy
  - date now has 0's inserted so dates like January 11th (20190111) and November 1st (20191101) wont collide
  - FTP section wrapped in try catch so FTP closing errors don't prevent script from showing URL of email, same with vinyl-ftp
- Build ZIP
  - only gives relative ZIP, absolute emails can be retrieved from deployed locations
  - nicely stamped as DATE-PROJET-CLIENT.zip

### Fixed
- Spaced out time between deploy/build/assemble steps to alleviate empty files getting pushed

## [1.0.0] (2019-01-30)

### Added
- `gulp build` creates hand-off-able ZIPs
- `gulp deploy` can be used to deploy to server
- changelog added (old one was just CLM Base's)
- `.node-version` added to support Windows users

### Changed
- Deep removal of old CLM Base sass
- Shared KM code removed
- Scaffolding works, similar to CLM Base
- Other naming references to CLM Base were translated to email equivalents

## [0.1.0] (2018-12-20)

### Added
- Working merged CLM Base and Zurb inky framework
