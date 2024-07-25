# webbot

This is the code-base for the Web-team irc bot and nicely called `webbot`.

It runs with [Hubot](https://hubot.github.com/). For more information on Hubot, go to [HUBOT.md](HUBOT.md)

## Scripts

Here is the list of great scripts that `webbot` provides:

- `acronyms.js`: get acronyms from a spreadsheet and translate them
- `example.coffee`: just a file of code example 
- `github-action-notifier.js`: an endpoint to notify a IRC channel that a GitHub Action as failed
- `pull-request-notifications.coffee`: an endpoint that listens to webhooks from GitHub and publishes a message on IRC on new pull-requests
- `release-notifications.coffee`: an endpoint to notify a given channel when a site gets released
- `jenkins-job-status.js`: an endpoint to return the status of a job's last build on jenkins
- `rt-portal.coffee`: rt#NUMBER to a clickable link
- `status.coffee`: an endpoint that returns OK
- `toto.coffee`: fun scripts


## Development

The simplest way to run the site locally is using [the `dotrun` snap](https://github.com/canonical-web-and-design/dotrun/):

``` bash
dotrun
```

Running the bot in your local terminal will start hubot in console mode (rather than irc), and allow local testing.

In case you want to connect it to IRC from a local machine. You need to get the webbot credentials and run the command:

``` bash
HUBOT_IRC_PASSWORD=<password> dotrun start-irc
```

The bot `totobot` should join the channel `#webbot-canonical-web-test`.

# Deploy
You can find the deployment config in the deploy folder.
