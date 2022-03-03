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

const axios = require("axios");
const MATTERMOST_ACCESS_TOKEN = process.env.MATTERMOST_ACCESS_TOKEN;

module.exports = async function (robot) {
  robot.router.post("/hubot/canonicool-reminders", async function (req, res) {
    const getOptions = {
      followRedirects: true,
      contentType: "application/json",
    };

    const postOptions = {
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + MATTERMOST_ACCESS_TOKEN,
      },
    };

    const url =
      "https://script.google.com/macros/s/AKfycbx63w1r5LW7PbfeyvEsMYH5B0ob2Mg9v1yr7Uwm1aI15QTAPGkbd74E_RREPCTTfxS3QA/exec?action=getPresenters";

    const presentersData = await axios.get(url, getOptions);
    const presenters = presentersData.data;

    const post_data = JSON.stringify({
      channel_id: "dewj9q7uk3d8pymujaez9ksyny",
      message: `@${presenters[0]}, @${presenters[1]} and @${presenters[2]}: You're up to present at this week's Canonicool. Please add abfjbfrej`,
    });

    const postRes = await axios.post(
      "https://chat.canonical.com/api/v4/posts",
      post_data,
      postOptions
    );
    const postID = postRes.data.id;
    const userID = postRes.data.user_id;

    ["x", "white_check_mark"].forEach((emoji) => {
      const reaction_data = JSON.stringify({
        post_id: postID,
        emoji_name: emoji,
        user_id: userID,
      });

      axios.post(
        "https://chat.canonical.com/api/v4/reactions",
        reaction_data,
        postOptions
      );
    });

  });
  robot.router.post("/hubot/canonicool-reminders-check", async function (req, res) {
    const two_hours_in_ms = 7200000;
    const since = new Date().valueOf() - two_hours_in_ms;

    robot
      .http(
        `https://chat.canonical.com/api/v4/channels/dewj9q7uk3d8pymujaez9ksyny/posts?since=${since}`
      )
      .header("Authorization", `Bearer ${MATTERMOST_ACCESS_TOKEN}`)
      .header("Content-Type", "application/json")
      .get()(function (err, _, body) {
        const posts = JSON.parse(body)["posts"];
        let latest_canonicool_reminder = null;

        for (let key in posts) {
          const post = posts[key];
          const message = post["message"];
          if (message.includes("You're up to present at this week's Canonicool.")) {
            if (latest_canonicool_reminder === null) {
              latest_canonicool_reminder = post;
            }

            if (latest_canonicool_reminder["create_at"] < post["create_at"]) {
              latest_canonicool_reminder = post;
            }
          }
        }

        metadata = latest_canonicool_reminder["metadata"];
        reactions = metadata["reactions"];

        if (reactions) {
          users_cancelled = []
          reactions.forEach(reaction => {
            if(reaction["emoji_name"] === "x" && reaction["user_id"] !== "q8yjh4wxupnw5jm5qw4omuw8zw") {
              users_cancelled.push(reaction["user_id"]);
            }
          })

          if (users_cancelled.lenght > 0) {
            user_ids_data = JSON.stringify(users_cancelled);
            robot
              .http(`https://chat.canonical.com/api/v4/users/ids`)
              .header("Authorization", `Bearer ${MATTERMOST_ACCESS_TOKEN}`)
              .header("Content-Type", "application/json")
              .post(user_ids_data)(function (err, _, body) {
                const users = JSON.parse(body);

                users.forEach(user => {
                  username = user["username"];

                  // call cancel api for this user
                });

                if (err) {
                  console.log(err);
                }
              });
          }
        }
      });
  });
};
