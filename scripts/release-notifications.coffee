# Description:
#   An HTTP Listener that announces new releases
#
# Dependencies:
#   "url": ""
#
# Configuration:
#   Set HUBOT_RELEASE_NOTIFICATION_ROOMS in environment (`#room1,#room2`)
#   Optionally set HUBOT_RELEASE_NOTIFICATION_SECRET in environment
#
# Commands:
#   None
#
# URLS:
#   POST /hubot/release-notification
#     data:
#       secret (key to prevent external use)
#       service_name (Name of service being released)
#

url = require('url')


secret = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET
unless secret?
  console.log "Missing HUBOT_RELEASE_NOTIFICATION_SECRET in environment"

rooms = process.env.HUBOT_RELEASE_NOTIFICATION_ROOMS
unless rooms?
  console.log "Missing HUBOT_RELEASE_NOTIFICATION_ROOMS in environment"
rooms = (rooms or "").split(',')


module.exports = (robot) ->
  robot.router.post "/hubot/release-notification", (req, res) ->

    data = req.body
    service_name = data.service_name

    if secret?
      unless data.secret is secret
        res.send "Invalid secret"
        res.end ""
        return

    unless service_name?
      res.send "Missing service_name"
      res.end ""
      return

    message = "The webteam is autodeploying #{service_name} to production"

    try
      for room in rooms
        do ->
          robot.messageRoom room, message
    catch error
      console.log "Release notification error: #{error}. Request: #{req.body}"

    res.end ""
