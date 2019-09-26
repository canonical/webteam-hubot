module.exports = (robot) ->
  robot.hear /toto/, (res) ->
    res
      .http 'http://smoke.toto.space'
      .header 'Content-Type', 'application/json'
      .get() (err, _, body) ->
        if err?
          res.send 'toto is loling at you'
        else
          data = JSON.parse(body)
          res.send "toto is so cool since #{data.days} days"
