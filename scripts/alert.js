// Description:
//   An HTTP Listener that notifies about alert from Grafana
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// Configuration:
//   set GRAFANA_USERNAME in environment
//   set GRAFANA_PASSWORD in environment
//
// URLS:
//   POST /hubot/grafana-alert?room=<room>
//   header:
//     Basic authentication that has username and password
//
// Authors:
//   tbille

var querystring, url;

url = require('url');
querystring = require('querystring');

var user = process.env.GRAFANA_USERNAME;
var pass = process.env.GRAFANA_PASSWORD;
var auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');

module.exports = function(robot) {
    return robot.router.post("/hubot/grafana-alert", function(req, res) {
        if (req.headers['authorization'] !== auth) {
            res.status(403);
            res.send("Invalid secret");
            return res.end("");
        }

        let query = querystring.parse(url.parse(req.url).query);
        let room = query.room;
        if (!room) {
            res.status(400);
            res.send("Parameters rooms required");
            return res.end("");
        }

        let data = req.body;
        let message = `[webteam-alert] 🚨 [${data["ruleName"]}](${data["ruleUrl"]}): ${data["message"]}`;

        try {
            robot.messageRoom(room, message);
        } catch (_error) {
            robot.messageRoom(room, "Whoa, I got an error: " + _error);
            console.log(("grafana alert notifier error: " + _error + ". ") + ("Request: " + req.body));
        }

        return res.end("");
    });
};
