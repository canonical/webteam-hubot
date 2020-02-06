const SPREADSHEET_ID = process.env.HUBOT_SPREADSHEET_ID;
var CREDS = {
    client_email: process.env.HUBOT_SPREADSHEET_CLIENT_EMAIL,
    private_key: process.env.HUBOT_SPREADSHEET_PRIVATE_KEY.replace(/\\n/g, '\n')
};

const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

async function googleSpreadsheetHandler(res) {
    var acronym, acronyms;
    acronym = res.match[1].toUpperCase();

    await doc.useServiceAccountAuth(CREDS);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    rows = await sheet.getRows();

    var response = rows.filter(a => a.Acronym.toUpperCase() === acronym)[0];

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
