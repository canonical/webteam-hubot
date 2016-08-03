# Webteam Hubot

For more information on Hubot, go to [HUBOT.md](HUBOT.md)

## Scipts

`hubots-scripts.json` loads scripts from the [https://github.com/github/hubot-scripts](hubots-scripts repository).
This package has been deprecated, and use discouraged.

`external-scripts.json` loads scripts from node modules.

Add files


## Development

The `master` branch is the canonical copy.
We have a `dev` branch for testing code, but this is not required. It is aimed to prevent interrupting the bot and people using it.

Running the bot in your local terminal will start hubot in console mode (rather than irc), and allow local testing.


## Deployment

Pushing to `master` will autodeploy and restart the bot.
Please keep this to a minimum during "peak hours" at work, when the bot is more likely to be in use.

Pushing to the `dev` branch will autodeploy to a dev instance.
webbot-dev can be found relaxing in #webbot on our IRC.
