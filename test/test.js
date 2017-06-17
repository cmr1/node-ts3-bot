'use strict';

const Bot = require('../');

const bot = new Bot();

bot.init();

bot.on('ready', () => {
  console.log('bot is ready');
});

bot.on('join', (channel) => {
  console.log('bot joined channel: ', channel);
})