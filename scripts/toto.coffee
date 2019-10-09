module.exports = (robot) ->
  robot.respond /toto/, (res) ->
    res
      .http 'http://smoke.toto.space'
      .header 'Content-Type', 'application/json'
      .get() (err, _, body) ->
        if err?
          res.send 'toto is loling at you'
        else
          data = JSON.parse(body)
          res.send "toto has been so cool for #{data.days} days"

  robot.respond /I love you/, (res) ->
    res.send("I love you too my friend.")
