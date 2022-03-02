// Description:
//   Scripts for canonicool:
//     - Endpoint to remind remind people who are supposed to be presenting that week
//
// Dependencies:
//   url: ""
//   querystring: ""
//
// Configuration:
//   set HUBOT_RELEASE_NOTIFICATION_SECRET in environment
//
// URLS:
//   POST /hubot/canonicool-reminders
//     data:
//       secret: secret for authentication (HUBOT_RELEASE_NOTIFICATION_SECRET)
//
// Authors:
//   bethcollins92 ClementChaumel

var url = require("url");
var querystring = require("querystring");

var SECRET_KEY = process.env.HUBOT_RELEASE_NOTIFICATION_SECRET;

module.exports = async function (robot) {
  robot.router.post("/hubot/canonicool-reminders", async function (req, res) {
    robot
      .http("https://api.sampleapis.com/movies/animation")
      .header("Content-Type", "application/json")
      .get()(function (err, _, body) {
      const data = JSON.parse(body);
      if (err) {
        console.log(err);
      }
      const person1 = data[0].title;
      const person2 = data[1].title;
      const person3 = data[2].title;

      robot.messageRoom(
        "sukha",
        `@${person1}, @${person2} and @${person3}: You're up to present at this week's Canonicool. Please add abfjbfrej`
      );
    });
  });

  robot
    .http(
      "https://chat.canonical.com/api/v4/channels/qxfj3ebmntf6urwz888p5frhwa/posts"
    )
    .header("Content-Type", "application/json")
    .get()(function (err, _, body) {
    console.log(body);
    if (err) {
      console.log(err);
    }
  });
};
