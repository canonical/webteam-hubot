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
//
// Commands:
//   hubot acronym <acronym>: translates the acronym to human readable words
//
// Note:
//   The format of the spreadsheet should be:
//
//   | Acronym | Definition   | Link                                                                                              |
//   | PR      | Pull-Request | https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests |
//
// Authors:
//   tbille

SPREADSHEET_ID = process.env.HUBOT_SPREADSHEET_ID;
if (!SPREADSHEET_ID) {
    console.log("Missing SPREADSHEET_ID in environment");
}

CLIENT_EMAIL = process.env.HUBOT_SPREADSHEET_CLIENT_EMAIL;
if (!CLIENT_EMAIL) {
    console.log("Missing CLIENT_ID in environment");
}

PRIVATE_KEY = process.env.HUBOT_SPREADSHEET_PRIVATE_KEY;
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

HTTPS_PROXY = process.env.HTTPS_PROXY;
if (HTTPS_PROXY) {
    doc.axios.defaults.proxy = false;
    const HttpsProxyAgent = require('https-proxy-agent');
    doc.axios.defaults.httpsAgent = new HttpsProxyAgent(HTTPS_PROXY);
}

async function googleSpreadsheetHandler(res) {
    var acronym, acronyms;
    acronym = res.match[1].toUpperCase().trim();

    await doc.useServiceAccountAuth(CREDS);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    rows = await sheet.getRows();

    var response = rows.filter(a => a.Acronym && a.Acronym.toUpperCase().trim() === acronym)[0];

    if (response) {
        return res.send(response.Acronym + ': ' + response.Definition + ' ' + response.Link);
    } else {
        return res.send('This acronym doens\'t exists (yet!)');
    }
}

module.exports = function(robot) {
    robot.respond(/acronym (.*)/, function(res) {
        googleSpreadsheetHandler(res);
    });
};
