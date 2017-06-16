'use strict';

const TARGET_MODE_PRIVATE = 1;
const TARGET_MODE_CHANNEL = 2;
const TARGET_MODE_SERVER = 3;

class Command {
  constructor({ bot, cmd, action, context }) {
    this.cmd = cmd;
    this.bot = bot;
    this.action = action;
    this.context = context;

    this.bot.on('textmessage', (data) => {
      if (data && data.invokeruid !== this.bot.options.user && (this.context === 0 || data.targetmode === this.context)) {
        this.process(data);
      }
    });
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
