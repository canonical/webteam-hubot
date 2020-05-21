// Description:
//   Scripts for powwow:
//     - Endpoint to remind team that questions are needed
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// Configuration:
//   set HUBOT_RELEASE_NOTIFICATION_SECRET in environment
//
// URLS:
//   POST /hubot/notify-powwow-form?room=<room>
//     data:
//       secret: secret for authentication (HUBOT_RELEASE_NOTIFICATION_SECRET)
//
// Authors:
//   tbille

var url = require('url');
var querystring = require('querystring');

var SECRET_KEY = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET;

module.exports = function(robot) {
    robot.router.post("/hubot/notify-powwow-form", async function(req, res) {
        var query = querystring.parse(url.parse(req.url).query);
        var data = req.body;
        if (!query.room) {
            res.send("Parameters rooms required");
            res.end("");
        }

        if (data.secret && data.secret === SECRET_KEY) {
	          robot.messageRoom(query.room, "😎 Hey hey hey, remember to add some questions in the form to get a great Powwow Quiz this Friday: https://forms.gle/j7J2Bbvo7usN7eqX9");
        } else {
            res.send("Invalid secret");
        }

        return res.end("");
    });
};
