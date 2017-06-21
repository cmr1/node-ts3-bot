'use strict';

const config = require('../config');

class Command {
  constructor({ bot, cmd, action, context }) {
    this.cmd = cmd;
    this.bot = bot;
    this.action = action;
    this.context = context;

    this.bot.on('textmessage', (data) => {
      if (data && data.invokeruid !== this.bot.options.user && (this.isGlobalContext() || data.targetmode === this.context)) {
        this.process(data);
      }
    });
  }

  isGlobalContext() {
    return this.context === config.constants.TextMessageTargetMode.TextMessageTarget_GLOBAL;
  }

  isClientContext() {
    return this.context === config.constants.TextMessageTargetMode.TextMessageTarget_CLIENT;
  }

  isChannelContext() {
    return this.context === config.constants.TextMessageTargetMode.TextMessageTarget_CHANNEL;
  }

  isServerContext() {
    return this.context === config.constants.TextMessageTargetMode.TextMessageTarget_SERVER;
  }

  process(data) {
    this.args = data.msg.replace(/\s+/g, ' ').trim().split(' ');

    if (this.args[0] === this.cmd) {
      this.bot.logger.log('Running CMD: ' + this.cmd);

      this.action(this.args, data);
    }
  }
}

module.exports = Command;
