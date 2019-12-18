module.exports = function(robot) {
  return robot.respond(/acronym (.*)/, function(res) {
    var acronym, acronyms;

    acronyms = require('../acronyms.json');
    acronym = res.match[1].toUpperCase();

    if (acronyms[acronym]) {
      return res.send(acronyms[acronym]);
    } else {
      return res.send('This acronym doens\'t exists (yet!)');
    }
  });
};
