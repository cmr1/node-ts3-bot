'use strict';

// const config = require('../config');

class Client {
  constructor({ bot, data, clid }) {
    this.cldbid = null;
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

  getInfo() {
    const { callback } = this.bot._args(arguments);

    this.bot._query('clientinfo', { clid: this.clid }, (err, resp, req) => {
      if (err) return callback(err);

      return callback(null, resp.data);
    });
  }

  getDbInfo() {
    const { callback } = this.bot._args(arguments);

    this.bot._query('clientdbinfo', { cldbid: this.cldbid }, (err, resp, req) => {
      if (err) return callback(err);

      return callback(null, resp.data);
    });
  }

  getServerGroups() {
    const { callback } = this.bot._args(arguments);

    this.bot._query('servergroupsbyclientid', { cldbid: this.cldbid }, (err, resp, req) => {
      if (err) return callback(err);

      return callback(null, Array.isArray(resp.data) ? resp.data : [ resp.data ]);
    });
  }

  addToServerGroup() {
    const { name, callback } = this.bot._args(arguments, {
      'string': 'name'
    });

    this.bot.getServerGroupByName(name, (err, group) => {
      if (err) return callback(err);

      this.bot._query('servergroupaddclient', { cldbid: this.cldbid, sgid: group.sgid }, (err, resp, req) => {
        if (err) {
          if (err.error_id && err.error_id === 2561) {
            this.message(`You are already a member of the group: ${name}`);
          }

          return callback(err);
        }

        this.bot.logger.log(`Added client: ${this.client_nickname} to servergroup: ${group.name}`);

        return callback();
      });
    });
  }

  addToChannelGroup() {
    // const { name, callback } = this.bot._args(arguments, {
    //   'string': 'name'
    // });

    // TODO
  }
}

module.exports = Client;
