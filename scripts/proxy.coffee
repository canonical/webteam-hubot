# Description:
#   Add proxy
#
# Dependencies:
#   proxy-agent
#
# Configuration:
#   set HTTP_PROXY in environment
#   set HTTPS_PROXY in environment
#
# Note:
#   https://hubot.github.com/docs/patterns/

proxy = require 'proxy-agent'

HTTP_PROXY = process.env.HTTP_PROXY || ""
HTTPS_PROXY = process.env.HTTPS_PROXY || ""

module.exports = (robot) ->
  robot.globalHttpOptions.httpAgent  = proxy(HTTP_PROXY, false)
  robot.globalHttpOptions.httpsAgent = proxy(HTTPS_PROXY, true)
