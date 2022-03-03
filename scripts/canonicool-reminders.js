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

const MATTERMOST_ACCESS_TOKEN = process.env.MATTERMOST_ACCESS_TOKEN;

module.exports = async function (robot) {
  robot.router.post("/hubot/canonicool-reminders", async function (req, res) {
    options = {
        followRedirects: true,
        contentType: 'application/json',
    }

    robot.http("https://script.google.com/a/macros/canonical.com/s/AKfycbyy9SW-G_0-PVUrv2hJDMTeCH2XQrrPDXlQUmOsjFQw3tXItPPagLCk_y61J62G6l12dA/exec?action=getAll", options)
      .get()(function (err, _, body) {
        console.log(body);
        const data = JSON.parse(body);
        if (err) {
          console.log(err);
        }
        const person1 = data[0].title;
        const person2 = data[1].title;
        const person3 = data[2].title;

        const post_data = JSON.stringify({
          channel_id: "dewj9q7uk3d8pymujaez9ksyny",
          message: `@${person1}, @${person2} and @${person3}: You're up to present at this week's Canonicool. Please add abfjbfrej`
        });

        robot
          .http("https://chat.canonical.com/api/v4/posts")
          .header("Content-Type", "application/json")
          .header("Authorization", `Bearer ${MATTERMOST_ACCESS_TOKEN}`)
          .post(post_data)(function (err, _, body) {
            const data = JSON.parse(body);

            ["x", "white_check_mark"].forEach(emoji => {
              const reaction_data = JSON.stringify({
                post_id: data["id"],
                emoji_name: emoji,
                user_id: data["user_id"]
              });

              robot
                .http("https://chat.canonical.com/api/v4/reactions")
                .header("Content-Type", "application/json")
                .header("Authorization", `Bearer ${MATTERMOST_ACCESS_TOKEN}`)
                .post(reaction_data)(function (err, _, body) {
                  const data = JSON.parse(body);
                  console.log(data);

                  if (err) console.log(err);
                });
            })

            if (err) console.log(err);
          });

    //     robot.messageRoom(
    //       "me-and-webbot",
    //       `@${person1}, @${person2} and @${person3}: You're up to present at this week's Canonicool. Please add abfjbfrej`
    //     );
    });

    // console.log("token", MATTERMOST_ACCESS_TOKEN);
    // robot
    //   .http(
    //     "https://chat.canonical.com/api/v4/channels/dewj9q7uk3d8pymujaez9ksyny/posts"
    //   )
    //   .header("Authorization", `Bearer ${MATTERMOST_ACCESS_TOKEN}`)
    //   .header("Content-Type", "application/json")
    //   .get()(function (err, _, body) {
    //     console.log(body);
    //     console.log("I was ehre!");
    //     if (err) {
    //       console.log(err);
    //     }
    //   });
  });
};
