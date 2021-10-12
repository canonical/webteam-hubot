//  A script that returns timezone information for a user
//
// Commands
//   hubot tz: returns current time and timezone information for a user
//
// Authors
//   Hackathon: @albertkol @clagom @elioqoshi @mrgnr
//

const JSDOM = require("jsdom").JSDOM;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const LAUNCHPAD_ROOT = "https://launchpad.net";

const MATTERMOST_TOKEN_CMD_TZ = process.env.MATTERMOST_TOKEN_CMD_TZ;
if (!MATTERMOST_TOKEN_CMD_TZ) {
  console.log("Missing MATTERMOST_TOKEN_CMD_TZ in environment");
}

const getTimezoneInfo = async (argument) => {
  if (!argument || argument.trim() === "help") {
    return (
      "**Mattermost `/tz` command**\n" +
      "\n" +
      "**Usage:**" +
      "\n" +
      "    `/tz <username> [username...]`\n"
    );
  }

  const usernames = argument
    .split(" ")
    .map((username) => username.replace("@", ""));

  var text = "";

  for (username of usernames) {
    const lpResponse = await fetch(`${LAUNCHPAD_ROOT}/~${username}`);
    text += text ? "\n" : "";

    if (lpResponse.status === 200) {
      const dom = new JSDOM(await lpResponse.text());
      const timeZoneContainer = dom.window.document.querySelector(
        "#timezone dd"
      );
      const timeZone = timeZoneContainer
        ? timeZoneContainer.innerHTML.split(" ")[0].trim()
        : undefined;

      if (timeZone) {
        const localTime = new Date()
          .toLocaleTimeString("en-GB", { timeZone })
          .trim();
        text +=
          `${username}'s timezone: ${timeZone}\n` +
          `${username}'s current time: ${localTime}\n`;
      } else {
        text += `Error: No timezone information found for user "${username}"`;
      }
    } else {
      text += `Error: User "${username}" not found\n`;
    }
  }

  return text;
};

module.exports = (robot) => {
  robot.respond(/tz ?(.*)/, async (res) => {
    res.send(await getTimezoneInfo(res.match[1]));
  });

  robot.router.post("/hubot/tz", async (req, res) => {
    if (MATTERMOST_TOKEN_CMD_TZ != req.body.token) {
      res.sendStatus(401);
      return res.end("");
    }

    let result;
    if (req.body.text) {
      result = await getTimezoneInfo(req.body.text);
    }

    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({ response_type: "ephemeral", text: result }));
    return res.end("");
  });
};
