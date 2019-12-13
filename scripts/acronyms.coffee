module.exports = (robot) ->
  robot.respond /acronym (.*)/, (res) ->
    acronyms = require('../acronyms.json')
    acronym = res.match[1].toUpperCase()

    if acronyms[acronym]
      res.send acronyms[acronym]
    else
      res.send 'This acronym doens\'t exists (yet!)'
