# Description:
#   An endpoint to check if the app is still alive
#
# URLS:
#   GET /_status/check

module.exports = (robot) ->
  robot.router.get "/_status/check", (req, res) ->
    res.send "ok"
    res.end
