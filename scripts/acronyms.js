const SPREADSHEET_ID = process.env.HUBOT_SPREADSHEET_ID;
var CREDS = {
    client_email: process.env.HUBOT_SPREADSHEET_CLIENT_EMAIL,
    private_key: process.env.HUBOT_SPREADSHEET_PRIVATE_KEY.replace(/\\n/g, '\n')
};

module.exports = function(robot) {
    var GoogleSpreadsheet = require('google-spreadsheet');
    var doc = new GoogleSpreadsheet(SPREADSHEET_ID);

    robot.respond(/acronym (.*)/, function(res) {
        var acronym, acronyms;
        acronym = res.match[1].toUpperCase();

        doc.useServiceAccountAuth(CREDS, function (err) {
            if (err) {
                console.log(err);
                return res.send('It seems there is an issue accessing the spreadsheet');
            }
            doc.getRows(1, function (err, rows) {
                if (err) {
                    console.log(err);
                    return res.send('It seems there is an issue with the spreadsheet');
                }
                var response = rows.filter(a => a.acronym.toUpperCase() === acronym)[0];
                if (response) {
                    return res.send(response.acronym + ': ' + response.definition + ' ' + response.link);
                } else {
                    return res.send('This acronym doens\'t exists (yet!)');
                }
            });
        });
    });
};
