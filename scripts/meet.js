// Description:
//   A Mattermost command to create a Google Meet.
//
// Commands:
//   hubot meet <@person1 @person2>:
//
// URLS:
//   POST /hubot/meet
//     Follows format suggested here: https://docs.mattermost.com/developer/slash-commands.html
//     data:
//       token: Should be similar than MATTERMOST_TOKEN
//       text: participants
//     response:
//       {"response_type": "ephemeral", "text": TEXT_POSTED}
//
// Authors:
//   

var MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN;
if (!MATTERMOST_TOKEN) {
    console.log("Missing MATTERMOST_TOKEN in environment");
}

async function generateMeetLink(participants) {
    return "https://g.co/meet/" + participants.replace(/@/g, "").replace(/ /g, "-");
}


module.exports = function(robot) {
    robot.respond(/meet (.*)/, async function(res) {
        res.send("Your meet is ready: " + await generateMeetLink(res.match[1]));
    });

    robot.router.post("/hubot/acronym", async function(req, res) {
        if (MATTERMOST_TOKEN != req.body.token) {
            res.sendStatus(401);
            return res.end("");
        }

        let result = `Create a new Meet and post the link to the current channel, format: \`/meet @{username} [@{username} ...]\``;

        if (req.body.text) {
            if (req.body.text.trim() != 'help') {
                robot.logger.info('Meet participants: ' + req.body.text);
                result = await generateMeetLink(req.body.text);
            }
        }

        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify({"response_type": "in_channel", "text": result}));
        return res.end("");
    });
};
