// Description:
//   Update the topic in #web-team to mention who is the support person
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// Configuration:
//   set HUBOT_RELEASE_NOTIFICATION_SECRET in environment
//
// Commands:
//   hubot update support: update the topic with the current person as support
//
// URLS:
//   POST /hubot/update-support?room=<room>
//     data:
//       secret: secret for authentication (HUBOT_RELEASE_NOTIFICATION_SECRET)
//
// Authors:
//   tbille

var url = require('url');
var querystring = require('querystring');

var SECRET_KEY = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET;

module.exports = function(robot) {
    function updateSupport(res, robot, rooms) {
        const supportTeam = [
            'carloswu',
            'toto',
            'FranCabrera',
            'joaomartins',
            'robin',
        ];

        let date = new Date().getDay();

        let supportHelp = '';
        if (date > 0 && date<=5) {
            let support = supportTeam[date-1];
            supportHelp =  `- Webteam ask ${support} for support.`;
        }

        let topic = `ubuntu.com folder - http://ubunt.eu/google-docs. We are the web team. We make websites & apps. Mention @webteam for help ${supportHelp}`;

        if (rooms) {
            rooms.forEach(function (room) {
                robot.adapter.command('TOPIC', room, topic);

                if (supportHelp) {
                    robot.messageRoom(support, 'Hey hey this is a reminder that today you are in support.');
                }
            });
        } else {
            res.topic(topic);
        }
    }

    robot.respond(/update support/i, function(res) {
        updateSupport(res);
    })

    robot.router.post("/hubot/update-support", async function(req, res) {
        var query = querystring.parse(url.parse(req.url).query);
        var data = req.body;
        if (!query.rooms) {
            res.send("Parameters rooms required");
            res.end("");
        }

        var rooms = query.rooms.split(',');

        if (data.secret && data.secret === SECRET_KEY) {
            await updateSupport(res, robot, rooms);
        } else {
            res.send("Invalid secret");
        }

        return res.end("");
    });
};
