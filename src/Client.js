'use strict';

class Client {
  constructor({ bot, data, clid }) {
    this.clid = clid;
    this.bot = bot;

    Object.keys(data).forEach(prop => {
      if (this[prop]) {
        bot._warn(`Overriding client property: ${prop}`);
      }

      this[prop] = data[prop];
    });
  }

  message(msg) {
    this.bot.logger.log(`Messaging client: '${this.client_nickname}' with msg: '${msg}'`);
    this.bot.messageClient(this.clid, msg);
  }
}

module.exports = Client;
