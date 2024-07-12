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

var url = require("url");

module.exports = function (robot) {
  return robot.router.post("/hubot/figma-library-alert", function (req, res) {
    let room = "figma-library-maintainers";

    // Check if X-Goog- header is present, so the callback came from the Google Drive Webhook
    if (req.headers["x-goog-channel-id"]) {
      let token = req.headers["x-goog-channel-token"];
      let resourceState = req.headers["x-goog-resource-state"];
      let changed = reg.headers["x-goog-changed"];
      let message = `On Google Drive ${token} changed. Action type: ${resourceState} ${
        changed ? `Change type: ${changed}` : ""
      }`;

      try {
        if (resourceState !== "sync") {
          if (
            !changed ||
            (changed !== "parents" && changed !== "permissions")
          ) {
            robot.messageRoom(room, message);
          }
        }
      } catch (_error) {
        robot.messageRoom(room, "Whoa, I got an error: " + _error);
        console.log(
          "figma library alert error: " +
            _error +
            ". " +
            ("Request: " + req.body)
        );
      }
    } else {
      // X-Goog- header not present, use default message which will be used in Github Actions
      let data = req.body;
      let message = `${data["source"]} has changed. Changes: ${data["change-summary"]}.`;

      try {
        robot.messageRoom(room, message);
      } catch (_error) {
        robot.messageRoom(room, "Whoa, I got an error: " + _error);
        console.log(
          "figma library alert error: " +
            _error +
            ". " +
            ("Request: " + req.body)
        );
      }
    }

    return res.end("");
  });
};
