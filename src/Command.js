'use strict';

const config = require('../config');

class Command {
  constructor({ bot, cmd, action, context }) {
    this.cmd = cmd;
    this.bot = bot;
    this.action = action;
    this.context = context;
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

  process(args, data) {
    if (data && (this.isGlobalContext() || data.targetmode === this.context)) {
      this.bot.logger.log('Running CMD: ' + this.cmd);

      this.action(args, data);
    }
  }
}

module.exports = Command;
