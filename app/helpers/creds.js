const argv = require('yargs').argv;
const path = '../sbxs/';

module.exports = () =>
{
  // Get credentials
  const sbx = argv['sbx'];
  const credPath = path+sbx+'.json';
  let creds = false;

  // if no creds passed in, return
  if (typeof sbx === 'undefined')
    return false;

  try
  {
    creds = require(credPath);
  }
  catch (e)
  {
    throw `sbxs/ does not have file ${credPath}`;
  }

  return creds;
}
