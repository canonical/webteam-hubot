# Description:
#   None
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   rt#0000 - Posts link to RT


module.exports = (robot) ->
  robot.hear /rt#\d+/ig, (res) ->
    for match in res.match
      parts = match.split "#"
      res.send  "https://portal.admin.canonical.com/" + parts[1]
