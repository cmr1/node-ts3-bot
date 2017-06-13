'use strict';

const async = require('async');
const EventEmitter = require('eventemitter2');
const Alfred = require('alfred-teamspeak');

const registerEvents = [
  'server',
  // 'channel',
  'textserver',
  // 'textchannel',
  'textprivate'
];

class BotCmd {
  constructor({ bot, cmd, action }) {
    this.cmd = cmd;
    this.bot = bot;
    this.action = action;

    this.bot.on('msg', (data) => {
      this.process(data);
    });
  }

  process(data) {
    if (data.msg) {
      const parts = data.msg.replace(/\s+/g, ' ').trim().split(' ');

      if (parts[0] === this.cmd) {
        console.log('Running CMD: ' + this.cmd);

        parts.shift();

        this.args = Object.assign([], parts);

        this.action(this.args, data);

        // this.bot.emit(this.cmd, this.args);
      }
    }
  }
}

class VerifyBot extends EventEmitter {
  constructor(options = {}) {
    super();

    this.updateInterval = process.env.UPDATE_INTERVAL || options.updateInterval || 1000;

    this.channels = {};
    this.serverGroups = {};
    this.channelGroups = {};

    this.commands = {};

    this.connection = {
      name: process.env.BOT_NAME || options.name || 'Alfred',
      host: process.env.TS3_HOST || options.host || '127.0.0.1',
      port: process.env.TS3_PORT || options.port || '10011',
      sid:  process.env.TS3_SID  || options.sid  || '1'
    };

    this.credentials = {
      user: process.env.TS3_USER || options.user || 'serveradmin',
      pass: process.env.TS3_PASS || options.pass || 'password'
    };

    this.alfred = new Alfred(this.connection);
    
    this.alfred.use(Alfred.User);

    this.alfred.login(this.credentials.user, this.credentials.pass).then(() => {
      this.init();
    }).catch((err) => {
      this.error(err)
    });
  }

  error(err) {
    console.error(err);
    this.emit('error', err);
  }

  join(cid) {
    this.alfred.send('whoami', data => {
      this.alfred.send('clientmove', { clid: data.client_id, cid });
    });
  }

  init() {
    this.emit('connected');

    this.listenChannels();
    // this.listenServerGroups();
    // this.listenChannelGroups();

    this.registerEvents().then(() => {
      this.emit('ready')
    }).catch((err) => {
      this.error(err)
    });

    this.on('ready', () => {
      this.alfred.on('cliententerview', data => console.log(data));
      this.alfred.on('textmessage', (data) => this.msg(data));
      this.alfred.on('clientmoved', data => console.log(data));
    });
  }

  cmd(cmd, action) {
    if (typeof this.commands[cmd] !== 'undefined') {
      throw new Error('cmd already registered!');
    } else {
      this.commands[cmd] = new BotCmd({ 
        bot: this,
        cmd,
        action
      });
    }
  }


  listenChannels() {
    setInterval(() => {
      this.alfred.send('channellist').then((data) => {
        const cids = Array.isArray(data.cid) ? data.cid : [ data.cid ];

        cids.forEach((cid, index) => {
          const channel = {
            cid: data.cid[index],
            pid: data.pid[index],
            name: data.channel_name[index],
            order: data.channel_order[index],
            clients: data.total_clients[index],
            needed_subscribe_power: data.channel_needed_subscribe_power[index]
          };

          if (!this.channels[cid]) {
            this.alfred.send('servernotifyregister', { event: 'textchannel', id: cid }).then(() => {
              console.log('Listening on channel:', channel.name, cid);
              this.channels[cid] = channel;
            }).catch(err => this.error(err));
          } else {
            this.channels[cid] = Object.assign(this.channels[cid], channel);
          }
        });

        Object.keys(this.channels).forEach((id, index) => {
          if (cids.indexOf(id) === -1) {
            console.log('Channel: ', this.channels[id], 'was deleted!');
            delete this.channels[id];
          }
        });

        // console.log(JSON.stringify(this.channels, null, 2));
      }).catch(err => this.error(err));
    }, this.updateInterval);
  }

  listenServerGroups() {
    setInterval(() => {
      this.alfred.send('servergrouplist').then((data) => {
        console.log(data);

        // const cids = Array.isArray(data.cid) ? data.cid : [ data.cid ];

        // cids.forEach((cid, index) => {
        //   const channel = {
        //     cid: data.cid[index],
        //     pid: data.pid[index],
        //     name: data.channel_name[index],
        //     order: data.channel_order[index],
        //     clients: data.total_clients[index],
        //     needed_subscribe_power: data.channel_needed_subscribe_power[index]
        //   };

        //   if (!this.channels[cid]) {
        //     this.alfred.send('servernotifyregister', { id: cid, event: 'textchannel' }).then(() => {
        //       console.log('Listening on channel:', channel.name, cid);
        //       this.channels[cid] = channel;
        //     }).catch(err => this.error(err));
        //   } else {
        //     this.channels[cid] = Object.assign(this.channels[cid], channel);
        //   }
        // });

        // Object.keys(this.channels).forEach((id, index) => {
        //   if (cids.indexOf(id) === -1) {
        //     console.log('Channel: ', this.channels[id], 'was deleted!');
        //     delete this.channels[id];
        //   }
        // });

        // console.log(JSON.stringify(this.serverGroups, null, 2));
      }).catch(err => this.error(err));
    }, this.updateInterval);
  }

  listenChannelGroups() {
    setInterval(() => {
      this.alfred.send('channelgrouplist').then((data) => {
        console.log(data);

        // const cids = Array.isArray(data.cid) ? data.cid : [ data.cid ];

        // cids.forEach((cid, index) => {
        //   const channel = {
        //     cid: data.cid[index],
        //     pid: data.pid[index],
        //     name: data.channel_name[index],
        //     order: data.channel_order[index],
        //     clients: data.total_clients[index],
        //     needed_subscribe_power: data.channel_needed_subscribe_power[index]
        //   };

        //   if (!this.channels[cid]) {
        //     this.alfred.send('servernotifyregister', { id: cid, event: 'textchannel' }).then(() => {
        //       console.log('Listening on channel:', channel.name, cid);
        //       this.channels[cid] = channel;
        //     }).catch(err => this.error(err));
        //   } else {
        //     this.channels[cid] = Object.assign(this.channels[cid], channel);
        //   }
        // });

        // Object.keys(this.channels).forEach((id, index) => {
        //   if (cids.indexOf(id) === -1) {
        //     console.log('Channel: ', this.channels[id], 'was deleted!');
        //     delete this.channels[id];
        //   }
        // });

        // console.log(JSON.stringify(this.channelGroups, null, 2));
      }).catch(err => this.error(err));
    }, this.updateInterval);
  }

  msg(data) {
    // console.log('verifying with data:', JSON.stringify(data, null, 2));

    console.log(data.targetmode);

    this.emit('msg', data);      

    // this.api.setAPIKey(data.msg);

    // this.api.getAccount().then(function(res) {
    //   console.log(JSON.stringify(res, null, 2));
    // });
 
    // this.api.setAPIKey(data.msg);

    // this.api.getCharacters().then(function (res) {
    //   for (var i = 0, len = res.length; i < len; i++) {
    //     // This API call just returns an array of string character names. 
    //     console.log(res[i]);
    //   }
    // });
  }

  registerEvents() {
    return new Promise((resolve, reject) => {
      async.each(registerEvents, (event, next) => {
        this.alfred.send('servernotifyregister', { event })
          .then(() => next())
          .catch(err => next(err));
      }, (err) => {
        if (err) return reject(err);

        return resolve();
      })
    });
  }
}

module.exports = VerifyBot;