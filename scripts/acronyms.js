module.exports = function(robot) {
  return robot.respond(/acronym (.*)/, function(res) {
    var acronym, acronyms;

    acronyms = require('../acronyms.json');
    acronym = res.match[1].toUpperCase();

    var response = acronyms.filter(a => a.acronym.toUpperCase() === acronym)[0];

    if (response) {
      return res.send(response.definition + ' ' + response.link);
    } else {
      return res.send('This acronym doens\'t exists (yet!)');
    }
  });
};
