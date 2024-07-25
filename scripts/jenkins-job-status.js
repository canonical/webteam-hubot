// Description:
//   An HTTP Listener that notifies about job statuses on Jenkins
//
// Dependencies:
//   jobName: ""
//
// URLS:
//   POST /hubot/jenkins-job-status?jobName=<job>
//     data:
//       jenkins_job_status: The status message from Jenkins
// Notes:
//   The data passed comes from Jenkins jobs.
//
//   You can query a job's status by using the following command:
//   webbot job status <jobName>
//
// Authors:
//   sam-olwe

const JENKINS_TOKEN = process.env.JENKINS_SECRET;
const JENKINS_URL = process.env.JENKINS_URL;

var querystring, fetch;

fetch = require("node-fetch");
querystring = require("querystring");

module.exports = async function (robot) {
  const echoJobStatus = (room, jobName, job_id) => {
    let job_id = job_id || "lastBuild";
    let job_json_url = `http://${JENKINS_URL}/job/${jobName}/${job_id}/api/json?${url_params}`;
    let url_params = `token=${JENKINS_TOKEN}`;

    // Fetch the status of the job from Jenkins
    fetch(job_json_url).then((response) => {
      if (response.ok) {
        let data = response.json();
        if (data.result === "FAILURE") {
          robot.messageRoom(
            room,
            "[webteam-jenkins] ❌ Jenkins job '" +
              jobName +
              "' failed." +
              `You can check the logs at ${data.url}` +
              "/console"
          );
        } else if (data.result === "SUCCESS") {
          robot.messageRoom(
            room,
            "[webteam-jenkins] ✅ Jenkins job '" + jobName + "' succeeded."
          );
        } else {
          robot.messageRoom(
            "[webteam-jenkins] 🛠️ Jenkins job '" +
              jobName +
              "' is still building." +
              `You can check the logs at ${data.url}` +
              "/console"
          );
        }
        return res.end("");
      } else {
        robot.messageRoom(room, "Status couldn't be retrieved: " + err);
        console.log(
          "Jenkins job status error: " + err + ". " + ("Request: " + req.body)
        );
        return res.end("");
      }
    });
  };

  const echoJobLogs = (room, jobName, job_id) => {
    let job_id = job_id || "lastBuild";
    let job_json_url = `http://${JENKINS_URL}/job/${jobName}/${job_id}/consoleText?${url_params}`;
    let url_params = `token=${JENKINS_TOKEN}`;

    // Fetch the job's logs from Jenkins
    fetch(job_json_url).then((response) => {
      if (response.ok) {
        robot.messageRoom(
          room,
          `[webteam-jenkins] 🛠️ Logs for Jenkins job ${jobName}'` +
            "\n" +
            "======================" +
            "\n" +
            response.text()
        );
        return res.end("");
      } else {
        robot.messageRoom(
          room,
          `Logs for job ${jobName} couldn't be retrieved: ` + err
        );
        console.log(
          "Jenkins job status error: " + err + ". " + ("Request: " + req.body)
        );
        return res.end("");
      }
    });
  };

  // Respond to:
  // webbot job status <jobName>
  // webbot job status <jobName> <job_id>
  robot.respond(/webbot job status\s?(\w)*\s?(\d){1,6}/i, async function (res) {
    const jobName = res.match[1];
    let job_id = res.match[2];

    const room = res.message.room;
    if (["Shell", "webteam-job-status"].includes(room)) {
      echoJobStatus(room, jobName, job_id);
    }
  });

  // Respond to:
  // webbot job logs <jobName>
  // webbot job logs <jobName> <job_id>
  robot.respond(/webbot job logs\s?(\w)*\s?(\d){1,6}/i, async function (res) {
    const jobName = res.match[1];
    let job_id = res.match[2];

    const room = res.message.room;
    if (["Shell", "webteam-job-status"].includes(room)) {
      echoJobLogs(room, jobName, job_id);
    }
  });

  robot.router.post("/hubot/report-jenkins-job-status", function (req, res) {
    let data = req.body;
    let jenkins_job = data.jenkins_job;
    let job_id = data.job_id;

    // Post the status to the webteam-job-status room
    echoJobStatus("webteam-job-status", jenkins_job, job_id);
    return res.end("");
  });
};
