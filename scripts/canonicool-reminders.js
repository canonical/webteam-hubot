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
//   bethcollins92 ClementChaumel albertkol mrgnr mtruj013

const axios = require("axios");
const MATTERMOST_ACCESS_TOKEN = process.env.MATTERMOST_ACCESS_TOKEN;
const options = {
  followRedirects: true,
  contentType: "application/json",
  headers: {
    Authorization: "Bearer " + MATTERMOST_ACCESS_TOKEN,
  },
};

const mattermostBaseURL = `https://chat.canonical.com/api/v4`;
const channelID = "dewj9q7uk3d8pymujaez9ksyny";

const deploymentID =
  "AKfycbwszM7zt5YoweTwRvXgh-VLKe0L49-1jIE30lkZXAZs85yMAm4Puzt32-zNZkSCT2wKdg";

const googleScriptBaseURL = `https://script.google.com/macros/s/${deploymentID}/exec?action=`;

const rotateURL = googleScriptBaseURL + "rotate";
const presentersURL = googleScriptBaseURL + "getPresenters";
const cancelURL = googleScriptBaseURL + "cancel";

module.exports = async function (robot) {
  robot.router.post("/hubot/canonicool-reminders", async function (req, res) {
    // Rotate the presenters and send a message to the channel pinging the new ones.
    const rotateRes = await axios.post(rotateURL, null, options);

    const presentersData = await axios.get(presentersURL, options);
    const presenters = presentersData.data;

    const postData = JSON.stringify({
      channel_id: channelID,
      message: `:canonicalparty: **Canonicool announcement!** :canonicalparty: 
      **@${presenters[0]}**, **@${presenters[1]}** and **@${presenters[2]}**: You're up to present at this week's Canonicool. 
      React with :x: if you can't make it, or :white_check_mark: if you can!`,
    });

    const postRes = await axios.post(
      `${mattermostBaseURL}/posts`,
      postData,
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

      axios.post(`${mattermostBaseURL}/reactions`, reaction_data, options);
    });
  });
  robot.router.post(
    "/hubot/canonicool-reminders-check",
    async function (req, res) {
      const mattermostPostsURL = `${mattermostBaseURL}/channels/${channelID}/posts`;

      const postsRes = await axios.get(mattermostPostsURL, options);
      const posts = Object.values(postsRes.data.posts);

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
        if (
          reaction.emoji_name === "x" &&
          reaction.user_id !== "q8yjh4wxupnw5jm5qw4omuw8zw"
        ) {
          cancelledUserIds.push(reaction.user_id);
        }
      });

      const cancelledUserNames = [];
      let userRes;
      for (const userId of cancelledUserIds) {
        userRes = await axios.get(
          `${mattermostBaseURL}/users/${userId}`,
          options
        );
        cancelledUserNames.push(userRes.data.username);
      }

      let presentersData = await axios.get(presentersURL, options);
      let presenters = presentersData.data;

      for (const userName of cancelledUserNames) {
        if (presenters.includes(userName)) {
          // cancel the user
          const cancelRes = await axios.post(
            cancelURL,
            JSON.stringify({
              name: userName,
            }),
            options
          );

          presentersData = await axios.get(presentersURL, options);
          presenters = presentersData.data;

          const postData = JSON.stringify({
            channel_id: channelID,
            message: `Oh no! Someone can't present this week. @${presenters[2]} would you be able to present? please react with :white_check_mark: or :x: on the message above. :point_up_2: Thanks!`,
            root_id: mostRecentAnnoucement.id,
          });

          const postRes = await axios.post(
            `${mattermostBaseURL}/posts`,
            postData,
            options
          );
        }
      }
    }
  );
};
