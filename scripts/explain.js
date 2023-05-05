// Description:
//    A place to get initial explanation of products or concepts
//    at Canonical based on a Google spreadsheet.
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
// | Explain | Definition                        | PM          | Contact | Link            |
// | ------- | --------------------------------- | ----------- | ------- | --------------- |
// | MAAS    | MAAS is a fast provisioning tool. | Anton Smith | ~MAAS   | https://maas.io |
//
// Authors:
//   amylily1011, goulinkh, toto

const {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
} = require("google-spreadsheet");
const { requiredEnvs } = require("./utils");

const {
  HUBOT_SPREADSHEET_ID,
  HUBOT_SPREADSHEET_CLIENT_EMAIL,
  HUBOT_SPREADSHEET_PRIVATE_KEY,
  MATTERMOST_TOKEN_CMD_EXPLAIN,
} = process.env;
const HTTPS_PROXY = process.env.HTTPS_PROXY;

requiredEnvs({
  HUBOT_SPREADSHEET_ID,
  HUBOT_SPREADSHEET_CLIENT_EMAIL,
  HUBOT_SPREADSHEET_PRIVATE_KEY,
  MATTERMOST_TOKEN_CMD_EXPLAIN,
});

const usage = `Format: \`/explain <concept>\` eg. \`/explain MAAS\`. If you want to see the top 5 unexplained terms try '\/explain top-5\' . Add your own [here](https://docs.google.com/spreadsheets/d/1nNk4typDnOfDEYRzlEjtd58zk-aOd3_NNp6eufthZHM/edit#gid=2064544629)`;

const googleServiceCreds = {
  client_email: HUBOT_SPREADSHEET_CLIENT_EMAIL,
  private_key: HUBOT_SPREADSHEET_PRIVATE_KEY,
};
const doc = new GoogleSpreadsheet(HUBOT_SPREADSHEET_ID);

if (HTTPS_PROXY) {
  doc.axios.defaults.proxy = false;
  const HttpsProxyAgent = require("https-proxy-agent");
  doc.axios.defaults.httpsAgent = new HttpsProxyAgent(HTTPS_PROXY);
}

const sanitizeValue = (value) => value.replace(/[\r\n]/, "").trim();
const valueIsEmpty = (value) =>
  !value || value.toLocaleLowerCase().trim() === "n/a";
const formatRowToMDTable = (row) => {
  let mdTable = `| Title | Description |\n|--|--|\n`;
  const rows = [];
  rows.push([row.Explain, row.Definition]);
  if (!valueIsEmpty(row.PM)) rows.push(["PM", row.PM]);
  if (!valueIsEmpty(row.Team)) rows.push(["Team", row.Team]);
  if (!valueIsEmpty(row.Contact)) rows.push(["Contact channel", row.Contact]);
  if (!valueIsEmpty(row.Link)) rows.push(["Read more", row.Link]);
  mdTable += rows
    .map((row) => `| ${sanitizeValue(row[0])} | ${sanitizeValue(row[1])} |`)
    .join("\n");
  return mdTable;
};

/**
 * A place to get initial explanation of products or concepts
 * at Canonical based on a Google spreadsheet.
 * @param {string} explainQuery a product or concept that needs explanation
 * @returns string
 */
async function fetchExplanation(explainQuery) {
  await doc.useServiceAccountAuth(googleServiceCreds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Explain"];
  if (explainQuery.toLowerCase().trim() == "why") {
    // Get a random row from the "why" sheet
    const why = doc.sheetsByTitle["Why"];
    const rows = await why.getRows();
    const randomRowIndex = parseInt(
      Math.floor(Math.random() * (rows.length + 1))
    );
    const whyRandomRow = rows.find((row) => row.rowIndex == randomRowIndex);
    const display_text = whyRandomRow.why;
    return display_text;
  } else if (explainQuery.toLowerCase().trim() == "top-5") {
    const unexplained_top = await unexplainedTop(doc);

    let unexplained_str = "Top 5 unexplained terms. Format: '<term>(count)' ";
    unexplained_top.forEach((u) => {
      unexplained_str = unexplained_str + ` - \'${u.Explain}(${u.Count})\'`;
    });

    unexplained_str =
      unexplained_str +
      `. If you can explain any of these terms or want to add your own [here](https://docs.google.com/spreadsheets/d/1nNk4typDnOfDEYRzlEjtd58zk-aOd3_NNp6eufthZHM/edit#gid=2064544629)`;

    return unexplained_str;
  } else {
    const rows = await sheet.getRows();

    const row = rows.find((row) => {
      row = row || {};
      const searchQuery = explainQuery.toLocaleLowerCase().trim();
      const explain = row.Explain || "";
      const alias = row.Alias || "";
      return (
        explain.toLowerCase().trim() === searchQuery ||
        alias
          .toLowerCase()
          .trim()
          .split(",")
          .map((e) => e.trim().toLocaleLowerCase())
          .find((keyword) => keyword == searchQuery)
      );
    });

    if (!row) {
      // add to the unexplained sheet
      unexplained(doc, explainQuery);
      return usage;
    }

    if (row.Count) {
      row.Count = parseInt(row.Count) + 1;
    } else {
      row.Count = "1";
    }
    row.save();

    return formatRowToMDTable(row);
  }
}

// compare 2 terms to get the one with the higher count - used for sorting
function compare(a, b) {
  if (parseInt(a.Count) >= parseInt(b.Count)) return -1;
  return 1;
}

/**
 *
 * @param doc
 * @returns top 5 unexplained terms
 */
async function unexplainedTop(doc) {
  const sheet = doc.sheetsByTitle["Unexplained"];
  const rows = await sheet.getRows();

  sorted = rows.sort(compare);

  return rows.slice(0, 5);
}

/**
 * For unexplained queries; either increments the search count or adds it as a new row
 * @param doc  google doc
 * @param unExplainedQuery the query that is unexpained
 */
async function unexplained(doc, unExplainedQuery) {
  const sheet = doc.sheetsByTitle["Unexplained"];

  const rows = await sheet.getRows();
  const searchQuery = unExplainedQuery.toLocaleLowerCase().trim();

  const row = rows.find((row) => {
    row = row || {};
    const explain = row.Explain || "";
    return explain.toLowerCase().trim() === searchQuery;
  });

  if (row) {
    row.Count = parseInt(row.Count) + 1;
    row.save();
  } else {
    // add new row
    await sheet.addRow({ Explain: searchQuery, Count: "1" });
  }
}

module.exports = function (robot) {
  robot.respond(/explain (.*)/, async function (res) {
    const explainQuery = res.match[1];
    res.send(await fetchExplanation(explainQuery));
  });

  robot.router.post("/hubot/explain", async function (req, res) {
    if (MATTERMOST_TOKEN_CMD_EXPLAIN != req.body.token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const explainQuery = req.body.text;
    if (!explainQuery || explainQuery.trim().match(/^(-)*h(elp)?$/gi)) {
      return res.json({ response_type: "ephemeral", text: usage });
    }
    robot.logger.info(": " + explainQuery);
    result = await fetchExplanation(explainQuery);
    return res.json({ response_type: "ephemeral", text: result });
  });
};
