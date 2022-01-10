// Description:
//   This adds a line to a spreadsheet when the bot hears `^jira .+`
//
// Dependencies:
//   google-spreadsheet: ""
//
// Configuration:
//   set HUBOT_SPREADSHEET_CLIENT_EMAIL in environment
//   set HUBOT_SPREADSHEET_PRIVATE_KEY in environment
//
// Authors:
//   caldav


var SPREADSHEET_ID = "1gEMoURd8-ssui9aSWUfyO7UKzgzU91t_HOWMMIDrEMg";

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

async function googleSpreadsheetHandler(card, user) {
    await doc.useServiceAccountAuth(CREDS);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const row = await sheet.addRow({ title: card, assignee: user });
    return row
}

module.exports = function(robot) {
  function updateSheet(card_title, res) {
    const user = res.envelope.user.name;
    res.send(`Created ${card_title} for ${user}`);
  }

  robot.hear(/^jira (.+)/i, async function(res) {
    if (!["Shell", "growth-eng"].includes(res.message.room)) {
      return;
    }
    if (res.message.text) {
      const card_title  = res.message.text.substr(res.message.text.indexOf(" ") + 1);
      robot.logger.info('growth-eng-jira: ' + card_title.trim());
      result = await googleSpreadsheetHandler(card_title.trim(), res.envelope.user.name);
      updateSheet(card_title, res);
    }
  });
};
