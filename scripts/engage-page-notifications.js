// Description:
//   An HTTP Listener that notifies about discourse enagage pages
//
// Dependencies:
//   crypto: ""
//   url: ""
//   querystring: ""
//
// Configuration:
//   set DISCOURSE_WEBHOOK_SECRET in environment
//
// URLS:
//   POST /hubot/engage-page-notification?room=<room>
//
// Authors:
//   jpmartinspt

var crypto = require('crypto')
var url = require('url');
var querystring = require('querystring');

var DISCOURSE_WEBHOOK_SECRET = process.env.DISCOURSE_WEBHOOK_SECRET;

async function getSignature(payload) {
  hmac = crypto.createHmac('sha256', DISCOURSE_WEBHOOK_SECRET)
  hmac.update(Buffer.from(JSON.stringify(payload)));
  return 'sha256=' + hmac.digest('hex')
}

async function sendMessages(robot, rooms, message) {
  rooms.forEach(function (room) {
    robot.messageRoom(room, message);
  });
}

module.exports = async function(robot) {
    robot.router.post("/hubot/engage-page-notification", async function(req, res) {
        var query = querystring.parse(url.parse(req.url).query);
        var data = req.body;

        var signature = await getSignature(data);
        if (signature !== req.headers["x-discourse-event-signature"]) {
          res.send("Invalid signature");
          return res.end("");
        }

        if (req.headers["x-discourse-event"] !== "topic_created") {
          res.send("Nothing to do for this event type");
          return res.end("");
        }

        if (!query.rooms) {
          res.send("Parameters rooms required");
          return res.end("");
        }

        var rooms = query.rooms.split(',');
        var { id, title, slug, created_by } = data.topic;
        var authorName = created_by.name || created_by.username;
        var topicURL = req.headers["x-discourse-instance"] + "/t/" + slug + "/" + id;
        var message = "New engage page ['" + title + "'](" + topicURL + ") created by " + authorName;

        await sendMessages(robot, rooms, message);

        return res.end("");
    });
};
