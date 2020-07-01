// Description:
//   An HTTP Listener that notifies about new GitHub actions that fail
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// URLS:
//   POST /hubot/gh-action-fail?room=<room>
//     data:
//       repo_name: The owner and repository name (GITHUB_REPOSITORY)
//       action_id: The unique identifier (id) of the action (GITHUB_ACTION)
//       workflow: Name of the workflow (GITHUB_WORKFLOW)
//
// Notes:
//   The data passed comes from https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
//   Room information can be obtained by hubot-script: room-info.coffee
//   Room must be in url encoded format (i.e. encodeURIComponent("yourRoomInfo"))
//
// Authors:
//   tbille

var querystring, url;

url = require('url');
querystring = require('querystring');

module.exports = function(robot) {
    return robot.router.post("/hubot/gh-action-fail", function(req, res) {
        var action_id, data, error, query, repo_name, room, workflow;
        query = querystring.parse(url.parse(req.url).query);
        data = req.body;
        repo_name = data.repo_name;
        action_id = data.action_id;
        workflow = data.workflow;

        room = query.room;

        try {
            robot.messageRoom(room, "[webteam-action] 🛑 The action ['" + workflow + "' failed](https://github.com/" + repo_name + "/actions/runs/" + action_id + ")");
        } catch (_error) {
            error = _error;
            robot.messageRoom(room, "Whoa, I got an error: " + error);
            console.log(("github action notifier error: " + error + ". ") + ("Request: " + req.body));
        }

        return res.end("");
    });
};
