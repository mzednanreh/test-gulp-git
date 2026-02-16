const replace = require('gulp-replace');
const dom     = require('gulp-jsdom');
const fs      = require('fs');


// Pull out fragments from email and save as separate files
const pullFragments = (dest) => {
  return dom(function(document) {
    const fragments = document.querySelectorAll('[data-fragment]');

    fragments.forEach((fragment, index) => {
      const number = index + 1;
      // get fragment's html and remove data-fragment attribute
      const content = fragment.outerHTML.replace(/data-fragment=""|data-fragment/gi, '');

      fs.writeFile(`${dest}/fragment-${number}.html`, content, () => {});
    });
  }, {}, false);
};


// Remove fragments from email
const removeFragments = () => {
  return dom(function(document) {
    const fragments = document.querySelectorAll('[data-fragment]');

    for (const fragment of fragments) {
      fragment.remove();
    }
  }, {}, false);
};


// Remove {{insertEmailFragments}} token from email
const removeFragmentsToken = () => {
  return replace(/{{\s?insertemailfragments\s?}}|{{\s?insertemailfragments\[[0-9]+,[0-9]+\]\s?}}/ig, '');
};


module.exports = {
  pullFragments,
  removeFragments,
  removeFragmentsToken,
};