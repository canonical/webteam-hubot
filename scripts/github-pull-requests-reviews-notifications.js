// Description:
//   An HTTP Listener that notifies about GitHub pull requests
//
// Dependencies:
//   url: ""
//   querystring: ""
//   graphql-request: ""
//
// Configuration:
//   set HUBOT_RELEASE_NOTIFICATION_SECRET in environment
//   set HUBOT_GITHUB_TOKEN in environment
//
// Commands:
//   hubot gh: sends a message with the number of pull requests pending
//   hubot gh report: sends a message with a report of the pull requests pending
//
// URLS:
//   POST /hubot/gh-pull-request-notification?room=<room>
//     data:
//       secret: secret for authentication (HUBOT_RELEASE_NOTIFICATION_SECRET)
//
// Authors:
//   tbille

var url = require('url');
var querystring = require('querystring');
var graphQuery = require("../api/github");

var SECRET_KEY = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET;


async function requestPullRequests(authors) {
    var authors_query = "";
    authors.forEach(function (author) {
        authors_query = authors_query.concat(" author:" + author);
    });

    var prsCount = 0;
    var next;
    while(true) {
        if (next) {
            var idNext = `, after: "${next}"`
        } else {
            var idNext = ""
        }
        var query =  `
            query MyQuery {
                organization(login: "canonical") {
                    team(slug: "web-and-design") {
                        repositories(last: 100${idNext}) {
                            nodes {
                                pullRequests(first: 100, states: OPEN) {
                                totalCount
                                }
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }
                }
            }`;

        var data = await graphQuery(query);

        data["organization"]["team"]["repositories"]["nodes"].forEach(function(repository) {
            prsCount = prsCount + repository["pullRequests"]["totalCount"]
        });

        if(data["organization"]["team"]["repositories"]["pageInfo"]["hasNextPage"]) {
            next = data["organization"]["team"]["repositories"]["pageInfo"]["endCursor"];
        } else {
            break;
        }
    }

    return prsCount;
}

async function sendNumberOpenedPullRequests(res, robot, rooms, authors) {
    var issueCount = await requestPullRequests(authors);

    var authors_query = "";
    authors.forEach(function (author) {
        authors_query = authors_query.concat("+author%3A" + author);
    });

    var message = "[webteam-pr] 📋 There are " + issueCount + " pull-requests open. You can find the list on [this dashboard](https://datastudio.google.com/reporting/4599ef41-f50d-4ace-b269-e6225a9b30e0/page/eTcwB)";

    if (rooms) {
        rooms.forEach(function (room) {
            robot.messageRoom(room, message);
        });
    } else {
        res.send(message);
    }
}

module.exports = async function(robot) {
    robot.respond(/gh report/i, function(res) {
        res.send("Not implemented yet");
    });

    robot.respond(/gh$/, function(res) {
        sendNumberOpenedPullRequests(res, robot, "", []);
    });

    robot.router.post("/hubot/gh-pull-request-notification", async function(req, res) {
        var query = querystring.parse(url.parse(req.url).query);
        var data = req.body;
        if (!query.rooms) {
            res.send("Parameters rooms required");
            res.end("");
        }

        var rooms = query.rooms.split(',');
        var authors;
        if (query.authors) {
            authors = query.authors.split(',');
        } else {
            authors = [];
        }

        if (data.secret && data.secret === SECRET_KEY) {
            await sendNumberOpenedPullRequests(res, robot, rooms, authors);
        } else {
            res.send("Invalid secret");
        }

        return res.end("");
    });
};
