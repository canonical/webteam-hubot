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
const options = {
  followRedirects: true,
  contentType: "application/json",
  headers: {
    Authorization: "Bearer " + MATTERMOST_ACCESS_TOKEN,
  },
};

const googleScriptBaseURL =
  "https://script.google.com/macros/s/AKfycbx63w1r5LW7PbfeyvEsMYH5B0ob2Mg9v1yr7Uwm1aI15QTAPGkbd74E_RREPCTTfxS3QA/exec?action=";

const rotateURL = googleScriptBaseURL + "rotate";
const presentersURL = googleScriptBaseURL + "getPresenters";
const cancelURL = googleScriptBaseURL + "cancel";

module.exports = async function (robot) {
  robot.router.post("/hubot/canonicool-reminders", async function (req, res) {
    // Rotate the presenters and send a message to the channel pinging the new ones.
    const rotateRes = await axios.post(rotateURL, null, options);

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
  robot.router.post(
    "/hubot/canonicool-reminders-check",
    async function (req, res) {
      const mattermostPostsURL =
        "https://chat.canonical.com/api/v4/channels/dewj9q7uk3d8pymujaez9ksyny/posts";

      const postsRes = await axios.get(mattermostPostsURL, options);
      const posts = Object.values(postsRes.data.posts);

      console.log(posts.length);

      const announcements = posts.filter((post) =>
        post.message.includes("You're up to present at this week's Canonicool.")
      );

      announcements.sort((a, b) => {
        return new Date(a.create_at) - new Date(b.create_at);
      });

      const mostRecentAnnoucement = announcements[announcements.length - 1];

      const reactions = mostRecentAnnoucement.metadata.reactions;

      const cancelledUserIds = [];

      reactions.forEach((reaction) => {
        console.log(reaction.emoji_name);
        if (
          reaction.emoji_name === "x" &&
          reaction.user_id !== "q8yjh4wxupnw5jm5qw4omuw8zw"
        ) {
          cancelledUserIds.push(reaction.user_id);
        }
      });

      const cancelledUserNames = [];
      var userRes;
      for (const userId of cancelledUserIds) {
        userRes = await axios.get(
          `https://chat.canonical.com/api/v4/users/${userId}`,
          options
        );
        cancelledUserNames.push(userRes.data.username);
      }

      var presentersData = await axios.get(presentersURL, options);
      var presenters = presentersData.data;
      console.log(presenters);

      for (const userName of cancelledUserNames) {
        if (presenters.includes(userName)) {
          // cancel the user
          console.log(`Cancelling ${userName}`);
          const cancelRes = await axios.post(
            cancelURL,
            JSON.stringify({
              name: userName,
            }),
            options
          );

          presentersData = await axios.get(presentersURL, options);
          presenters = presentersData.data;

          const post_data = JSON.stringify({
            channel_id: "dewj9q7uk3d8pymujaez9ksyny",
            message: `Oh no! Someone can't present this week. @${presenters[2]} would you be able to present? please react with :white_check_mark: or :x: on the message above. :point_up_2: Thanks!`,
            root_id: mostRecentAnnoucement.id,
          });

          const postRes = await axios.post(
            "https://chat.canonical.com/api/v4/posts",
            post_data,
            options
          );
        }
      }
    }
  );
};
