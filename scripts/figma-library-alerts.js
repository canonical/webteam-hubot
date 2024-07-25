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
      const token = req.headers["x-goog-channel-token"];
      let resourceState = req.headers["x-goog-resource-state"];
      let changed = req.headers["x-goog-changed"];
      let message = `On Google Drive ${token} changed. Action type: ${resourceState} ${
        changed ? `Change type: ${changed}` : ""
      }`;

      try {
        if (resourceState !== "sync" && resourceState !== "add") {
          if (changed) {
            // Split the changed string into an array
            const changedArray = changed.split(",").map((item) => item.trim());

            // Define the changes we're not interested in
            const uninterestingChanges = [
              "parents",
              "permissions",
              "properties",
            ];

            // Check if the array includes any changes we're interested in
            const hasInterestingChange = changedArray.some(
              (change) => !uninterestingChanges.includes(change)
            );

            if (hasInterestingChange) {
              robot.messageRoom(room, message);
            }
          } else {
            // If changed is not present, we still want to send the message
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
      if (data) {
        const message = `${data["source"]} has changed. Changes: ${data["change-summary"]}.`;
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
    }
    return res.status(200).end("");
  });
};
