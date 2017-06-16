'use strict';

const Bot = require('./src/Bot');

const bot = new Bot({
  name: 'Woodhouse',
  user: 'serveradmin',
  pass: 'abc123',
  channel: "Bot's Channel"
});

bot.init();

bot.on('ready', () => {
  bot.server.message(`Ready for service.`);
});

bot.on('join', channel => {
  channel.message(`Type "woodhouse" or "help" if you have any questions`);
});

bot.on('cliententerchannel', context => {
  context.channel.message(`Hello, ${context.client.client_nickname}`);
});

bot.on('clientleftchannel', context => {
  context.client.message('Goodbye!');
})