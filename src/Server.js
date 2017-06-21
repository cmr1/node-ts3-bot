'use strict';

// const config = require('../config');

class Server {
  constructor({ bot, data }) {
    this.bot = bot;

    Object.keys(data).forEach(prop => {
      if (this[prop]) {
        bot._warn(`Overriding server property: ${prop}`);
      }

      this[prop] = data[prop];
    });
  }

  message(msg) {
    this.bot.logger.log(`Messaging server: '${msg}'`);
    this.bot.messageServer(msg);
  }
}

module.exports = Server;
