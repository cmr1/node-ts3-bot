[![npm version](https://badge.fury.io/js/cmr1-ts3-bot.svg)](https://www.npmjs.com/package/cmr1-ts3-bot)
<!--[![build status](https://travis-ci.org/cmr1/node-ts3-bot.svg?branch=master)](https://travis-ci.org/cmr1/node-ts3-bot)-->

# node-ts3-bot

A simple bot framework for TeamSpeak3

### Install
`npm install cmr1-ts3-bot --save`

### Usage

```javascript
// Require cmr1-ts3-bot
const Bot = require('cmr1-ts3-bot');

// Create a new bot with desired configuration (these are the default values)
const bot = new Bot({
  sid: 1,
  name: 'Woodhouse',
  user: 'serveradmin',
  pass: 'password',
  host: '127.0.0.1',
  port: 10011,
  channel: 'Default Channel',
  verbose: false
});

// Initialize the bot (callback is optional)
bot.init((err) => {
  if (err) // Something didn't work
  else     // The bot is alive!
});

// Listen for the bot's "ready" event (emitted after succesfull "init")
bot.on('ready', () => {
  // Send a message to the TS3 main server chat
  bot.server.message('Ready for service');
});

// Listen for the bot's "join" event (the bot will automatically join the channel specified)
bot.on('join', channel => {
  // Send a message to the channel that the bot has now joined
  channel.message('I have joined this channel!');
});

// Register a command for this bot that can be invoked in the channel chat
bot.channelCommand('ping', (args, context) => {
  // When someone says "ping" in the bot's channel, reply to that channel with "pong"
  bot.channel.message('pong');
});
```

### Configuration

The bot can be configured when created (as shown above) or using environment variables:

```bash
# Bot Settings
BOT_VERBOSE=0
BOT_NAME=Woodhouse

# TS3 Settings
TS3_SID=1
TS3_USER=serveradmin
TS3_PASS=password
TS3_CHANNEL=Default Channel
TS3_HOST=127.0.0.1
TS3_PORT=10011
```

### Methods

- `init`
- `disconnect`
- `shutdown`
- `getServerGroupByName`
- `getServer`
- `getClientById`
- `getClientByName`
- `getChannelById`
- `getChannelByName`
- `globalCommand`
- `clientCommand`
- `channelCommand`
- `serverCommand`
- `messageClient`
- `messageChannel`
- `messageServer`

### Events

- `ready`
- `join`
- `action`
- `unknowncommand`
- `cliententerview`
- `clientleftview`
- `cliententerchannel`
- `clientleftchannel`
- `warning`
- `failure`