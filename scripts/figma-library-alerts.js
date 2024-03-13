// Description:
//   An HTTP Listener that notifies about a change in one of the sources-of-truth of our Figma libraries
//
// Dependencies:
//   url: ""
//
// URLS:
//   POST /hubot/figma-library-alert
//
// Authors:
//   dgtlntv

var url;

url = require("url");

module.exports = function (robot) {
  return robot.router.post("/hubot/figma-library-alert", function (req, res) {
    let room = "figma-library-maintainers";

    let data = req.body;
    let message = `Hello library maintainers! :) ${data["source"]} has changed. Here is what changed${data["change-summary"]}. Please update the Figma libraries accordingly.`;

    try {
      robot.messageRoom(room, message);
    } catch (_error) {
      robot.messageRoom(room, "Whoa, I got an error: " + _error);
      console.log(
        "figma library alert error: " + _error + ". " + ("Request: " + req.body)
      );
    }

    return res.end("");
  });
};
