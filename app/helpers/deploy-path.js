
// Generate timestamp based deploy path for emails
module.exports = (project) =>
{
  let data  = project.meta;
  let date  = new Date
  let path = [];
  let stamp = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];

  // if either day or month is less than 10 put a zero infront
  if (stamp[1] < 10)
    stamp[1] = '0' + stamp[1];

  if (stamp[2] < 10)
    stamp[2] = '0' + stamp[2];

  path.push(data.product);
  path.push(data.name);
  path.push(stamp.join(''));

  return path;
};

