// Description:
//   Would like to meet, is a human readable acronym translator that reads from a Google spreadsheet.
//
// Dependencies:
//   google-spreadsheet: ""
//
// Configuration:
//   set HUBOT_SPREADSHEET_ID in environment
//   set HUBOT_SPREADSHEET_CLIENT_EMAIL in environment
//   set HUBOT_SPREADSHEET_PRIVATE_KEY in environment
//   set MATTERMOST_TOKEN_CMD_ACRONYM in environment
//
// Commands:
//   hubot acronym <acronym>: translates the acronym to human readable words
//
// URLS:
//   POST /hubot/acronym
//     Follows format suggested here: https://docs.mattermost.com/developer/slash-commands.html
//     data:
//       token: Should be similar than MATTERMOST_TOKEN_CMD_ACRONYM
//       text: acronym
//     response:
//       {"response_type": "ephemeral", "text": TEXT_POSTED}
//
// Note:
//   The format of the spreadsheet should be:
//
//   | Acronym | Definition   | Link                                                                                              |
//   | PR      | Pull-Request | https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests |
//
// Authors:
//   tbille

const axios = require("axios");

const gcalLink = (fullName1, fullName2) => {
  const today = new Date()
  let event = new Date(today);
  const meetDateStart = new Date(event.getFullYear(), event.getMonth(), event.getDate() + 1, 12, 0, 0);
  const meetDateEnd = new Date(event.getFullYear(), event.getMonth(), event.getDate() + 1, 12, 25, 0);
  const gcalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=WLTM${fullName1}+%26+${fullName2}&details=Here is a Would Like to Meet for you and Peter Mahnke.&dates=${meetDateStart.toISOString()}%2F${meetDateEnd.toISOString()}`
  return gcalLink;
}

module.exports = function (robot) {
  robot.router.post("/hubot/wltm", async function (req, res) {

    commands = ["find", "join", "leave", "whois", "snooze", "leave", "bio"]
    let text;
    if (process.env.MATTERMOST_TOKEN_CMD_WLTM != req.body.token) {
      res.sendStatus(401);
      return res.end("");
    }

    if (req.body.text) {
      if (commands.includes(req.body.text.trim())) {
        const expr = req.body.text.trim();
        let text = ""

        // hardcoded Person to meet
        const username = "peterm-ubuntu";

        const token = process.env.WEBBOT_TOKEN;
        const findUserHeaders = {'Content-Type': 'application/json', "Authorization" : `Bearer ${token}`}
        const currentUser = "carloswufei";
        console.log(req.body.text)
        if (expr.match(/bio (.*)/)) {
          console.log(req.body.text)
          // axios.get(`https://intl.transitionelement.com/wltm/index.cgi?a=bio&id=carloswufei&bio=${}`)
          text = "Use bio <text> to update. Your current bio: I'm into Schnitzel, Perl and cats."
          res.setHeader("Content-type", "application/json");
          res.send(JSON.stringify({ response_type: "ephemeral", text: text }));
          return
        }

        switch (expr) {
          case "find":
            axios.get(`http://localhost:8065/api/v4/users/username/${username}`, { headers: findUserHeaders }).then(x => {
              const mmUserId = x.data.id;

              const fullName = `${x.data.first_name || "Peter"}+${x.data.last_name || "Mahnke"}`;
              console.log("User found", mmUserId);

              axios.get(`http://localhost:8065/api/v4/bots`, { headers: findUserHeaders }).then(bot => {
                const webbot = bot.data.find(item => item.username === "webbot");
                console.log(webbot);

                axios.post("http://localhost:8065/api/v4/channels/direct", [mmUserId, webbot.user_id], { headers: findUserHeaders }).then(createChannelRes => {
                  console.log("Channel created", createChannelRes.data.id)
                  console.log("Gcal link", gcalLink("Carlos Wu", fullName))
                  const awltmMsg = `Hello! You're invited to a 1-2-1 'coffee-chat' with Peter Mahnke <@peterm-ubuntu> [directory](https://directory.canonical.com/orgchart/Peter%20Mahnke/).\n Bio: “Python, music, and passionate about languages." \nProposed Meet is in your [GCal](${gcalLink("Carlos Wu", fullName)}) Tomorrow, at 12:00 GMT. [Chat](http://localhost:8065/wltm-team/messages/@${username}) to Carlos Wu, and agree the time.`;
                  const newChannelId = createChannelRes.data.id;
                  const newChannelContent = {
                    "channel_id": newChannelId,
                    "message": awltmMsg,
                  }
                  axios.post("http://localhost:8065/api/v4/posts", newChannelContent, { headers: findUserHeaders }).then(postAwltmMsgRes => {
                    console.log("Messaged wltm")
                    res.setHeader("Content-type", "application/json");
                    res.send(JSON.stringify({ text: text }));
                  });
                })
              })
            })
            break;
          case "join":
            // let url = "https://intl.transitionelement.com/wltm/index.cgi?a=join&id=${currentUser}"
            const testUrl = "https://reqres.in/api/products/3"
            axios.get(testUrl, { headers: {"Content-type": "application/json"}} ).then(content => {
              console.log(content)
              const text = "You joined WLTM. Welcome!\nThe @wltm bot will send you invites to 1-2-1 coffee-chats - as GoogleMeets to your Calendar, and will alert you, with a DM in Mattermost. Use **find** to set up your first meet."
              res.setHeader("Content-type", "application/json");
              res.send(JSON.stringify({ response_type: "ephemeral", text: text }));
            });
            break;
          case "leave":
            console.log(req.body.text)
            axios.get(`https://intl.transitionelement.com/wltm/index.cgi?a=leave&id=${currentUser}`,).then(content => {
              console.log(content.data)
              res.setHeader("Content-type", "application/json");
              res.send(JSON.stringify({ response_type: "ephemeral", text: "You have been removed from wltm" }));
            });
            break;
          case "snooze":
            axios.get(`https://intl.transitionelement.com/wltm/index.cgi?a=snooze&id=${currentUser}`).then(content => {
              text = "No more invitations from @wltm for 3 months."
              res.setHeader("Content-type", "application/json");
              res.send(JSON.stringify({ response_type: "ephemeral", text: text }));
            })
            break;
          default:
            text =
            "Would Like to Meet helps you set up GoogleMeet 'coffee-chats' with a random Canonicaller. When you join you will receive invitations to 25 minute meets, up to 6 times a year.\nThe following options are accepted: join, find, leave, whois, snooze, leave, bio.";
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify({ response_type: "ephemeral", text: text }));
            break;
        }
          return
      }
    }
  });
};
