// Description:
//   Get informantion about meeting records on canonical-web-and-desing/meeting-notes
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
//   hubot meeting <meeting_label>: sends the link to the last meeting
//
// Authors:
//   jpmartinspt

const graphQuery = require("../api/github");


module.exports = async function (robot) {
    robot.respond(/meeting (.*)/, async function (res) {
        const meetingName = res.match[1];
        const lastMeetingQuery = `
                { 
                    repository(name:"meeting-notes", owner:"canonical-web-and-design") {
                        issues(labels:"${meetingName}", last:1) {
                            edges {
                                node {
                                    id
                                    url
                                }
                            }
                        }
                    }
                }`;

        try {
            const data = await graphQuery(lastMeetingQuery);
            res.send(data["repository"]["issues"]["edges"][0]["node"]["url"]);
        } catch(error) {
            res.send("No meeting labeled '" + meetingName + "'.");
        }
    });
};
