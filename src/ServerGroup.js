'use strict';

class ServerGroup {
  constructor({ bot, data, sgid }) {
    this.sgid = sgid;
    this.bot = bot;

    Object.keys(data).forEach(prop => {
      if (this[prop]) {
        bot._warn(`Overriding servergroup property: ${prop}`);
      }

      this[prop] = data[prop];
    });
  }

  // message(msg) {
  //   this.bot.logger.log(`Messaging channel: '${this.channel_name}' with msg: '${msg}'`);
  //   this.bot.messageChannel(this.cid, msg);
  // }
}

module.exports = ServerGroup;
