'use strict';

const Bot = require('../');

const bot = new Bot({
  pass: 'abc123',
  channel: 'test'
});

bot.init();

bot.on('ready', () => {
  console.log('bot is ready');
});

bot.on('join', channel => {
  channel.message('welcome!');
});

bot.on('cliententerview', (context) => {
  context.client.getServerGroups((err, groups) => {
    if (err) console.error(err);

    if (groups.length === 1 && groups[0].sgid === 8) {
      context.client.message('Welcome, ' + context.client.client_nickname);
    }
  })

  // bot._query('servergrouplist', (err, resp, req) => {
  //   console.log(resp);
  // })
});

bot.channelCommand('ping', (args, context) => {
  bot.channel.message('pong');
});