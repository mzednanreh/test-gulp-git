const getCreds = require('./creds.js');

module.exports = function(emails, meta) {

  // shortcuts
  this.emails = emails;
  this.keys = Object.keys(emails);
  this.meta = meta;
  // set creds if sbx arg passed in
  this.creds = getCreds();

};
