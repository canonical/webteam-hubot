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
const proxy = require('proxy-agent');

const { GraphQLClient } = require('graphql-request');

var SECRET_KEY = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET;
var TOKEN = process.env.HUBOT_GITHUB_TOKEN;
var HTTPS_PROXY = process.env.HTTPS_PROXY || "";

async function requestPullRequests(res, authors) {
    var authors_query = "";
    authors.forEach(function (author) {
        authors_query = authors_query.concat(" author:" + author);
    });

    var query =  `
      {
        search(query: "org:canonical-web-and-design is:pr is:open archived:false ${authors_query}", type: ISSUE, last: 100) {
          edges {
            node {
              ... on PullRequest {
                url
                title
                author {login}
                createdAt
              }
            }
          }
        }
      }`;

    const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
        headers: {
            'authorization': 'Bearer ' + TOKEN,
            'content-type': 'application/json'
        },
        agent: proxy(HTTPS_PROXY, true)
    });

    const data = await graphQLClient.request(query);
    return data["search"]["edges"];
}

async function sendNumberOpenedPullRequests(res, robot, rooms, authors) {
    var pr = await requestPullRequests(res, authors);

    var authors_query = "";
    authors.forEach(function (author) {
        authors_query = authors_query.concat("+author%3A" + author);
    });

    var message = "[webteam-pr] 📋 There are " + pr.length + " pull-requests open. You can find the list here: https://github.com/search?q=org%3Acanonical-web-and-design+is%3Apr+is%3Aopen+archived%3Afalse" + authors_query;

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
        sendNumberOpenedPullRequests(res, robot);
    });

    robot.router.post("/hubot/gh-pull-request-notification", async function(req, res) {
        var query = querystring.parse(url.parse(req.url).query);
        var data = req.body;
        if (!query.rooms) {
            res.send("Parameters rooms required");
            res.end("")
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
