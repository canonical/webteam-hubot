// Description:
//   An HTTP Listener that notifies about low storage on Jenkins
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// URLS:
//   POST /hubot/low-space-jenkins?room=<room>
//     data:
//       jenkins_node: The Jenkins node
//       storage_usage: The percentage of storage used by the jenkins node
//
// Notes:
//   The data passed comes from Jenkins jobs
//   Room information can be obtained by hubot-script: room-info.coffee
//   Room must be in url encoded format (i.e. encodeURIComponent("yourRoomInfo"))
//
// Authors:
//   jkfran

var querystring, url;

url = require('url');
querystring = require('querystring');

module.exports = function(robot) {
    return robot.router.post("/hubot/low-space-jenkins", function(req, res) {
        var query, data, jenkins_node, storage_usage, room, error;
        query = querystring.parse(url.parse(req.url).query);
        data = req.body;
        jenkins_node = data.jenkins_node;
        storage_usage = data.storage_usage;

        room = query.room;

        try {
            robot.messageRoom(room, "[webteam-jenkins] 🛑 Jenkins node '" + jenkins_node + "' is using " + storage_usage + "% of storage.");
        } catch (_error) {
            error = _error;
            robot.messageRoom(room, "Whoa, I got an error: " + error);
            console.log(("Jenkins space notifier error: " + error + ". ") + ("Request: " + req.body));
        }

        return res.end("");
    });
};
