'use strict';

const Bot = require('../../');

const bot = new Bot({
  // verbose: true
});

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

bot.on('cliententerview', (context) => {
  // context.getClient((err, client) => {
  //   console.log(err, client);
  // });

  context.client.getServerGroups((err, groups) => {
    if (err) {
      bot.logger.warn('Unable to get server groups for client!', err, context);
    
    // New user is a guest
  } else if (groups.length === 1 && groups[0].sgid === 8) {
    context.client.message('hello');
    }
  });
});

bot.on('unknowncommand', (context) => {
  if (context.client) {
     context.client.message('I dont understand: ' + context.msg);
  }
});

bot.channelCommand('ping', (args, context) => {
  console.log('Example - Simple: Bot has received command "ping", sending response "pong" to channel');
  bot.channel.message('pong');
});