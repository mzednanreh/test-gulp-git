const replace = require('gulp-replace');


// gulp-jsdom changes DOCTYPE during DOM manipulations
// fix for this bug
module.exports = () => {
  const doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

  return replace('<!DOCTYPE html>', doctype);
}