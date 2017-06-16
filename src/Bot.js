'use strict';

const config = require('../config');
const async = require('async');
const EventEmitter = require('eventemitter2');
const TeamSpeak = require('node-teamspeak-api');
const Logger = require('cmr1-logger');
const Command = require('./Command');

const defaultArgTypes = {
  'string': 'action',
  'function': 'callback',
  'object': (obj) => { return Array.isArray(obj) ? 'options' : 'params' }
};

const registerEvents = [
  'server',
  // 'channel',
  'textserver',
  'textchannel',
  'textprivate'
];

class Bot extends EventEmitter {
  constructor(options = {}) {
    super();

    this.client = {};
    this.commands = {};

    this.options = {
      sid:  process.env.TS3_SID  || options.sid  || '1',
      user: process.env.TS3_USER || options.user || 'serveradmin',
      pass: process.env.TS3_PASS || options.pass || 'password',
      name: process.env.BOT_NAME || options.name || 'Woodhouse',
      channel: process.env.TS3_CHANNEL || options.channel || 'Default Channel',
      host: process.env.TS3_HOST || options.host || '127.0.0.1',
      port: process.env.TS3_PORT || options.port || '10011',
      watch: process.env.TS3_WATCH || options.watch || 1000,
      verbose: !!process.env.BOT_VERBOSE || options.verbose || false
    }

    this.ts3 = new TeamSpeak(this.options.host, this.options.port);

    this.logger = new Logger(this.options);
    this.logger.enableLogging(config.logging);
    
    this.on('ready', () => {
      this.logger.success(`${this.options.name} is ready!`);

      registerEvents.forEach(event => {
        this.logger.debug(`Registering for '${event}' notifications`);
        this.ts3.subscribe({ event });
      });

      this.ts3.on('notify', (event, resp) => {
        resp.respond = (msg) => {
          if (resp.invokerid) {
            this._query('sendtextmessage', {
              targetmode: 1,
              target: resp.invokerid,
              msg
            }, (err, resp, req) => {
              this.logger.debug('Responded');
            });
          }
        }

        this.logger.debug(`Received notification for event: '${event}' with response:`, resp);
        this.emit(event, resp);
      });
    });

    this.globalCommand('help', (args, data) => {
      data.respond(`Hi! My name is ${this.options.name}, how can I help you?`);
    });
  }

  init() {
    const { callback } = this._args(arguments);

    this._login(err => {
      if (err) return callback(err);  

      this._query('whoami', (err, resp, req) => {
        if (err) return callback(err);

        this.client = resp.data;

        this._use(err => {
          if (err) return callback(err);

          this._query('clientupdate', { client_nickname: this.options.name }, (err, resp, req) => {
            if (err) return callback(err);

            this._join(err => {
              if (err && err.error_id && err.error_id === 770) {
                this.logger.warn(`Already member of channel: ${this.options.channel}`);
              } else if (err) {
                return callback(err);
              } 

              this.emit('ready');

              return callback();
            });
          });
        });
      });
    });
  }

  globalCommand(cmd, action) {
    this.command(cmd, action, 0);
  }

  privateCommand(cmd, action) {
    this.command(cmd, action, 1);
  }
  
  channelCommand(cmd, action) {
    this.command(cmd, action, 2);
  }

  serverCommand(cmd, action) {
    this.command(cmd, action, 3);
  }

  command(cmd, action, context=1) {
    if (typeof this.commands[cmd] !== 'undefined') {
      this._error(`Command: '${cmd}' is already registered!`);
    } else {
      this.commands[cmd] = new Command({ 
        bot: this,
        cmd,
        action,
        context
      });
    }
  }

  _args(args, types = {}) {
    const typeMap = Object.assign({}, defaultArgTypes, types);

    const parsed = {};

    Object.keys(args).forEach(index => {
      const argValue = args[index];
      const argType = typeof argValue;

      if (typeMap[argType]) {
        const argName = typeMap[argType];

        if (typeof argName === 'string') {
          parsed[argName] = argValue;
        } else if (typeof argName === 'function') {
          const argKey = argName(argValue);
          parsed[argKey] = argValue;
        } else if (typeof argName !== 'boolean') {
          this._error(`Invalid arg name for type: ${argType}! Arg name must be string or function.`);
        }
      } else if (argType !== 'undefined') {
        this._warn('Unknown argument type: ', argType);
      }
    });

    if (!parsed.callback || typeof parsed.callback !== 'function') {
      this.logger.warn('Invalid/missing callback provided');
      parsed.callback = () => this.logger.debug(arguments);
    }

    this.logger.debug('Processing raw args:', args);
    this.logger.debug('Parsed args:', parsed);

    return parsed;
  }

  _query() {
    const { action, params, callback } = this._args(arguments);

    this.ts3.send(action, params, (err, resp, req) => {
      this.logger.debug(`Query: ${action} with params: ${JSON.stringify(params)}`);

      if (err) {
        this._error(`Action failed! Action: ${action} | Params: ${JSON.stringify(params)}`, err);
        return callback(err);
      }

      this.logger.debug('Request:', JSON.stringify(req, null, 2));
      this.logger.debug('Response:', JSON.stringify(resp, null, 2));

      this.emit('action', {
        req,
        resp,
        action,
      });

      if (resp.status !== 'ok') {
        this._warn('Bad Response!', req, resp);
      }

      return callback(null, resp, req);
    });
  }

  _join() {
    const { callback } = this._args(arguments);

    this.logger.log(`Attempting to find & join channel: ${this.options.channel}`);

    const channel_find_params = { pattern: this.options.channel };

    this._query('channelfind', channel_find_params, (err, resp, req) => {
      if (err) return callback(err);

      this.logger.log('Channel found.');

      this._query('clientmove', { clid: this.client.client_id, cid: resp.data.cid }, (err, resp, req) => {
        if (err) return callback(err);

        this.logger.log('Channel joined.');

        return callback();
      });
    });
  }

  _login() {
    const { callback } = this._args(arguments);

    const login_params = {
      client_login_name: this.options.user,
      client_login_password: this.options.pass
    };

    this.logger.log(`Attempting to login as user: ${this.options.user}`);

    this._query('login', login_params, (err, resp, req) => {
      if (err) callback(err);

      this.logger.log('Authenticated.');

      return callback();
    });
  }

  _use() {
    const { callback } = this._args(arguments);

    this.logger.log(`Attempting to use virtual server: ${this.options.sid}`);

    const use_params = {
      sid: this.options.sid
    };

    this._query('use', use_params, (err, resp, req) => {
      if (err) return callback(err);

      this.logger.log('Using virtual server.');

      return callback();
    });
  }

  _warn(msg) {
    this.emit('warning', msg);
    this.logger.warn(msg);
  }

  _error(err) {
    this.emit('failure', err);
    this.logger.error(err);
  }
}

module.exports = Bot;