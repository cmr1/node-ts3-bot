'use strict';

const async = require('async');
const EventEmitter = require('events');
const Alfred = require('alfred-teamspeak');

var gw2 = require('gw2-api');
var api = new gw2.gw2();


const registerEvents = [
  'server',
  // 'channel',
  'textserver',
  // 'textchannel',
  'textprivate'
];

class VerifyBot extends EventEmitter {
  constructor(options = {}) {
    super();

    this.api = new gw2.gw2();

    const connection = {
      name: '',
      host: '',
      port: '',
      sid: ''
    };

    this.alfred = new Alfred();
    this.alfred.use(Alfred.User);
    this.alfred.login('serveradmin', 'abc123')
      .then(() => this.init())
        .catch((err) => this.error(err));
  }

  error(err) {
    console.error(err);
    this.emit('error', err);
  }

  init() {
    this.emit('connected');

    this.api.setStorage(new gw2.memStore());

    this.registerEvents()
      .then(() => this.emit('ready'))
        .catch((err) => this.error(err));

    this.on('ready', () => {
      this.alfred.send('channellist')
        .then(data => this.listenChannels(data))
        .catch(err => this.error(err));

      this.alfred.on('cliententerview', data => console.log(data));
      this.alfred.on('textmessage', (data) => this.verify(data));
      this.alfred.on('textserver', (data) => console.log(data));
      this.alfred.on('textchannel', (data) => console.log(data));

      this.alfred.on('*', function() {
        console.log(this.event, arguments);
      })
      
    });
  }

  listenChannels(data) {
    // this.alfred.send('servernotifyregister', { id:data.cid[0], event: 'channel' })
    //     .then(() => console.log('channel #'+data.cid[0]))
    //     .catch(err => this.error(err));
    console.log(data);

    data.cid.forEach(id => {
      this.alfred.send('servernotifyregister', { id, event: 'textchannel' })
        .then(() => console.log('channel #'+id))
        .catch(err => this.error(err));
    })
  }

  verify(data) {
    console.log('verifying with data:', JSON.stringify(data, null, 2));

    this.api.setAPIKey(data.msg);

    this.api.getAccount().then(function(res) {
      console.log(JSON.stringify(res, null, 2));
    });
 
    this.api.setAPIKey(data.msg);

    this.api.getCharacters().then(function (res) {
      for (var i = 0, len = res.length; i < len; i++) {
        // This API call just returns an array of string character names. 
        console.log(res[i]);
      }
    });
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