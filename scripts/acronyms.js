// Description:
//   A human readable acronym translator that reads from a Google spreadsheet.
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

var SPREADSHEET_ID = process.env.HUBOT_SPREADSHEET_ID;
if (!SPREADSHEET_ID) {
    console.log("Missing SPREADSHEET_ID in environment");
}

var CLIENT_EMAIL = process.env.HUBOT_SPREADSHEET_CLIENT_EMAIL;
if (!CLIENT_EMAIL) {
    console.log("Missing CLIENT_ID in environment");
}

var PRIVATE_KEY = process.env.HUBOT_SPREADSHEET_PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.log('Missing PRIVATE_KEY in environment');
} else {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

var CREDS = {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY
};

const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

var HTTPS_PROXY = process.env.HTTPS_PROXY;
if (HTTPS_PROXY) {
    doc.axios.defaults.proxy = false;
    const HttpsProxyAgent = require('https-proxy-agent');
    doc.axios.defaults.httpsAgent = new HttpsProxyAgent(HTTPS_PROXY);
}

var MATTERMOST_TOKEN_CMD_ACRONYM = process.env.MATTERMOST_TOKEN_CMD_ACRONYM;
if (!MATTERMOST_TOKEN_CMD_ACRONYM) {
    console.log("Missing MATTERMOST_TOKEN_CMD_ACRONYM in environment");
}

async function googleSpreadsheetHandler(acronym) {
    var acronyms;
    await doc.useServiceAccountAuth(CREDS);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    var rows = await sheet.getRows();

    var responses = rows.filter(a => a.Acronym && a.Acronym.toUpperCase().trim() === acronym);

    var text = "";
    responses.forEach(function (response) {
        if (text) { text = text + '\n'; }
        var link = response.Link ? response.Link : "";
        var definition = response.Definition ? response.Definition : "";
        text = text + response.Acronym + ': ' + definition + ' ' + link;
    });

    if (text) {
        return text;
    } else {
        return `This acronym doesn't exist (yet!). Add your own [here](https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID})`;
    }
}

module.exports = function(robot) {
    robot.respond(/acronym (.*)/, async function(res) {
        let acronym = res.match[1].toUpperCase().trim();
        let result = await googleSpreadsheetHandler(acronym);
        res.send(result);
    });

    robot.router.post("/hubot/acronym", async function(req, res) {
        console.log(res)
        if (MATTERMOST_TOKEN_CMD_ACRONYM != req.body.token) {
            res.sendStatus(401);
            return res.end("");
        }

        let result = `Format: \`/acronym <acronym>\` eg. \`/acronym usn\`. Add your own [here](https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID})`;
        if (req.body.text) {
            if (req.body.text.trim() != 'help') {
                robot.logger.info('acronym: ' + req.body.text.toUpperCase().trim());
                result = await googleSpreadsheetHandler(req.body.text.toUpperCase().trim());
            }
        }

        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify({"response_type": "ephemeral", "text": result}));
        return res.end("");
    });
};
