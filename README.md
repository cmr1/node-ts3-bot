whois? define user?
whereis? locate user
channel help?
verification

# node-ts3-bot

### Install
`npm install cmr1-ts3-bot --save`

### Usage

```javascript
const Bot = require('cmr1-ts3-bot');

const bot = new Bot();

bot.init((err) => {
  if (err) {
    console.error('Bot failed to initialize', err);
  } else {
    console.log('Example - Simple: Bot initialized');
  }
});

bot.on('ready', () => {
  console.log('Example - Simple: Bot is ready');
});

bot.on('join', channel => {
  console.log('Example - Simple: Bot has joined channel');
});

bot.channelCommand('ping', (args, context) => {
  console.log('Example - Simple: Bot has received command "ping", sending response "pong" to channel');
  bot.channel.message('pong');
});
```
