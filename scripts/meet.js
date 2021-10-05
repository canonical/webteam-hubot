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
//       token: Should be similar than MATTERMOST_TOKEN_CMD_MEET
//       text: participants
//     response:
//       {"response_type": "in_channel", "text": TEXT_POSTED}
//
// Authors:
//   Hackday: wgx, jkfran, nottrobin

var MATTERMOST_TOKEN_CMD_MEET = process.env.MATTERMOST_TOKEN_CMD_MEET;
if (!MATTERMOST_TOKEN_CMD_MEET) {
    console.log("Missing MATTERMOST_TOKEN_CMD_MEET in environment");
}

async function cmdOutput(creator, participants) {
    let link = await generateMeetLink(participants)

    return '| ![Meet](https://assets.ubuntu.com/v1/fa583301-meet-bot-logo.png =50 "Meet icon") Your Meet is ready  |\n' +
            '|:---------------|\n' +
            '| **Creator:** ' + creator + ' |\n' +
            '| **Attendees:** ' + participants + ' |\n' +
            '| [![Meet](https://assets.ubuntu.com/v1/26764e76-button.png =120 "Meet icon")](' + link + ') | ';
}

async function generateMeetLink(participants) {
    let code = participants.replace(/@/g, "").replace(/ /g, "-").slice(0, 59);
    return "https://accounts.google.com/AccountChooser/signinchooser?flowName=GlifWebSignIn&flowEntry=AccountChooser&continue=https://meet.google.com/lookup/" + code
}


module.exports = function(robot) {
    robot.respond(/meet (.*)/, async function(res) {
        res.send(await cmdOutput(res.envelope.user.name, res.match[1]));
    });

    robot.router.post("/hubot/meet", async function(req, res) {
        if (MATTERMOST_TOKEN_CMD_MEET != req.body.token) {
            res.sendStatus(401);
            return res.end("");
        }

        let result = `Create a new Meet and post the link to the current channel, format: \`/meet @{username} [@{username} ...]\``;

        if (req.body.text) {
            if (req.body.text.trim() != 'help') {
                robot.logger.info('Meet participants: ' + req.body.text);
                result = await cmdOutput(req.body.user_name, req.body.text);
            }
        }

        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify({"response_type": "in_channel", "icon_url": "https://assets.ubuntu.com/v1/fa583301-meet-bot-logo.png", "text": result}));
        return res.end("");
    });
};
