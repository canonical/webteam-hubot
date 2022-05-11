// Description:
//   A place to get initial explanation of products or concepts at Canonical that reads from a Google spreadsheet.
//
// Dependencies:
//   google-spreadsheet: ""
//
// Configuration:
//   set HUBOT_SPREADSHEET_ID in environment
//   set HUBOT_SPREADSHEET_CLIENT_EMAIL in environment
//   set HUBOT_SPREADSHEET_PRIVATE_KEY in environment
//   set MATTERMOST_TOKEN_CMD_EXPLAIN in environment
//
// Commands:
//   hubot explain <product|concept>: explains the concepts and provides reading resources
//
// URLS:
//   POST /hubot/explain
//     Follows format suggested here: https://docs.mattermost.com/developer/slash-commands.html
//     data:
//       token: Should be similar than MATTERMOST_TOKEN_CMD_ACRONYM
//       text: explain
//     response:
//       {"response_type": "ephemeral", "text": TEXT_POSTED}
//
// Note:
//   The format of the spreadsheet should be:
//
//   | Explain | Definition                            | PM          | Contact | Link                                                                                              |
//   | MAAS    | MAAS is a fast provisioning tool..... | Anton Smith | ~MAAS   | https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests |
//
// Authors:
//   tbille, amylily1011

const SPREADSHEET_ID = process.env.HUBOT_SPREADSHEET_ID;
if (!SPREADSHEET_ID) {
  console.log("Missing HUBOT_SPREADSHEET_ID in environment");
}

const CLIENT_EMAIL = process.env.HUBOT_SPREADSHEET_CLIENT_EMAIL;
if (!CLIENT_EMAIL) {
  console.log("Missing HUBOT_SPREADSHEET_CLIENT_EMAIL in environment");
}

let PRIVATE_KEY = process.env.HUBOT_SPREADSHEET_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.log("Missing HUBOT_SPREADSHEET_PRIVATE_KEY in environment");
} else {
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");
}

const CREDS = {
  client_email: CLIENT_EMAIL,
  private_key: PRIVATE_KEY,
};

const { GoogleSpreadsheet } = require("google-spreadsheet");
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const HTTPS_PROXY = process.env.HTTPS_PROXY;
if (HTTPS_PROXY) {
  doc.axios.defaults.proxy = false;
  const HttpsProxyAgent = require("https-proxy-agent");
  doc.axios.defaults.httpsAgent = new HttpsProxyAgent(HTTPS_PROXY);
}

const MATTERMOST_TOKEN_CMD_EXPLAIN = process.env.MATTERMOST_TOKEN_CMD_EXPLAIN;
if (!MATTERMOST_TOKEN_CMD_EXPLAIN) {
  console.log("Missing MATTERMOST_TOKEN_CMD_EXPLAIN in environment");
}

async function googleSpreadsheetHandler(explain) {
  await doc.useServiceAccountAuth(CREDS);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Explain"];
  const sheet_why = doc.sheetsByTitle["Why"];

  if (explain == "WHY") {
    //If the input text is WHY
    //get 'why' rows from sheet['Why']
    const why_rows = await sheet_why.getRows();
    const why_rows_length = why_rows.length;
    const random_node = parseInt(
      Math.floor(Math.random() * (why_rows_length + 1))
    );

    //find the random element in why_row
    const why_text = why_rows.find((a) => a.rowIndex == random_node);
    const display_text = why_text.why;
    return display_text;
  } else {
    const rows = await sheet.getRows();
    const responses = rows.filter(
      (a) => a.Explain && a.Explain.toUpperCase().trim() === explain
    );
    let text = "";
    responses.forEach(function (response) {
      const link = response.Link ? response.Link : "";
      const definition = response.Definition ? response.Definition : "";
      const MM_Channel = response.Contact ? response.Contact : "";
      const PM = response.PM ? response.PM : "";
      const team = response.Team ? response.Team : "";
      text = `\n| ${response.Explain} | ${definition} |\n| PM | ${PM} |\n| Team | ${team} |\n| Contact channel | ${MM_Channel} |\n| Read more | ${link} |`;
    });

    if (text) {
      return text;
    }
    return `We cannot explain this product/concept yet. Add your explanation [here](https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID})`;
  }
}

module.exports = function (robot) {
  robot.respond(/explain (.*)/, async function (res) {
    const explain = res.match[1].toUpperCase().trim();
    const result = await googleSpreadsheetHandler(explain);
    res.send(result);
  });

  robot.router.post("/hubot/explain", async function (req, res) {
    if (MATTERMOST_TOKEN_CMD_EXPLAIN != req.body.token) {
      res.sendStatus(401);
      return res.end("");
    }

    let result = `Format: \`/explain <concept>\` eg. \`/explain MAAS\`. Add your own [here](https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID})`;
    if (req.body.text) {
      if (req.body.text.trim() != "help") {
        robot.logger.info(": " + req.body.text.toUpperCase().trim());
        result = await googleSpreadsheetHandler(
          req.body.text.toUpperCase().trim()
        );
      }
    }

    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({ response_type: "ephemeral", text: result }));
    return res.end("");
  });
};
