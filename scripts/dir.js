//  A script that returns the directory url of the user
//
// Commands
//   webbot dir <search_query>: returns directory url of the user
//
// URLS:
//   POST /hubot/dir
//     Follows format suggested here: https://docs.mattermost.com/developer/slash-commands.html
//     data:
//       token: Should be similar than MATTERMOST_TOKEN_CMD_DIR
//       text: query search for
//     response:
//       {"response_type": "ephemeral", "text": TEXT_POSTED}
//
// Authors
//   Hackathon

const MATTERMOST_TOKEN_CMD_DIR = process.env.MATTERMOST_TOKEN_CMD_DIR;
if (!MATTERMOST_TOKEN_CMD_DIR) {
  console.log("Missing MATTERMOST_TOKEN_CMD_DIR in environment");
}

async function generateDirectoryLink(argument) {
  const urlBase="https://directory.canonical.com";
  const validCategories = ["id", "name", "surname", "nickname"];
  const argumentList = argument.split(" ");

  if (argument === "help") {
    return '\n' +
            '**Mattermost `/dir` command**\n' +
            '\n' +
            '**Usage:**' +
            '\n' +
            '    `/dir [category] <search_query>` \n' +
            '\n' +
            '**Category:** \n' +
            '    `id` - Launchpad ID of the user \n' +
            '    `name` - First name of the user \n' +
            '    `surname` - Surname of the user \n' +
            '    `nickname` - Nickname of the user';
  }

  if (argumentList.length === 1) {
    return `${urlBase}/search?query=${encodeURIComponent(argument)}`;
  }

  if (argumentList.length > 1) {
    const category = argumentList.shift();

    if (!validCategories.includes(category)) {
      return "Invalid category. Category must be one of: `name`, `surname`, `nickname`, `id`";
    }

    const searchString = argumentList.join(" ");

    switch(category) {
      case "name":
        return `${urlBase}/list/firstname/${encodeURIComponent(searchString)}`;
      case "surname":
        return `${urlBase}/list/surname/${encodeURIComponent(searchString)}`;
      case "nickname":
        return `${urlBase}/list/ircnick/${encodeURIComponent(searchString)}`;
      case "id":
        return `${urlBase}/list/lpid/${encodeURIComponent(searchString)}`;
    }
  }
}

module.exports = function(robot) {
  robot.respond(/dir ?(.*)?/, async function(res) {
    res.send(await generateDirectoryLink(res.match[1]));
  });

  robot.router.post("/hubot/dir", async function(req, res) {
    if (MATTERMOST_TOKEN_CMD_DIR != req.body.token) {
      res.sendStatus(401);
      return res.end("");
    }

    let result;
    if (req.body.text) {
      result = await generateDirectoryLink(req.body.text);
    }

    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify({"response_type": "ephemeral", "text": result}));
    return res.end("");
  });

};
