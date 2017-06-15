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
    const parts = data.msg.replace(/\s+/g, ' ').trim().split(' ');

    if (parts[0] === this.cmd) {
      this.bot.logger.log('Running CMD: ' + this.cmd);

      parts.shift();

      this.args = Object.assign([], parts);

      this.action(this.args, data);

      // this.bot.emit(this.cmd, this.args);
    }
  }
}

module.exports = Command;
