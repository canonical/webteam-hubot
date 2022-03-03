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
    const options = {
      followRedirects: true,
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + MATTERMOST_ACCESS_TOKEN,
      },
    };

    const baseURL =
      "https://script.google.com/macros/s/AKfycbx63w1r5LW7PbfeyvEsMYH5B0ob2Mg9v1yr7Uwm1aI15QTAPGkbd74E_RREPCTTfxS3QA/exec?action=";

    const rotateURL = baseURL + "rotate";
    const presentersURL = baseURL + "getPresenters";

    // Rotate the presenters and send a message to the channel pinging the new ones.
    axios.post(rotateURL, null, options);

    const presentersData = await axios.get(presentersURL, options);
    const presenters = presentersData.data;

    const post_data = JSON.stringify({
      channel_id: "dewj9q7uk3d8pymujaez9ksyny",
      message: `@${presenters[0]}, @${presenters[1]} and @${presenters[2]}: You're up to present at this week's Canonicool. Please add abfjbfrej`,
    });

    const postRes = await axios.post(
      "https://chat.canonical.com/api/v4/posts",
      post_data,
      options
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
        options
      );
    });
  });
};
