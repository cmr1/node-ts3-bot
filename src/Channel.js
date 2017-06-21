'use strict';

// const config = require('../config');

class Channel {
  constructor({ bot, data, cid }) {
    this.cid = cid;
    this.bot = bot;

    Object.keys(data).forEach(prop => {
      if (this[prop]) {
        bot._warn(`Overriding channel property: ${prop}`);
      }

      this[prop] = data[prop];
    });
  }

  message(msg) {
    this.bot.logger.log(`Messaging channel: '${this.channel_name}' with msg: '${msg}'`);
    this.bot.messageChannel(this.cid, msg);
  }
}

module.exports = Channel;
