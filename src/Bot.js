'use strict';

// Load configuration
const config = require('../config');

const EventEmitter = require('eventemitter2');
const TeamSpeak = require('node-teamspeak-api');
const Logger = require('cmr1-logger');

const Client = require('./Client');
const Server = require('./Server');
const Channel = require('./Channel');
const Command = require('./Command');

const defaultArgTypes = {
  'number': 'id',
  'string': 'action',
  'function': 'callback',
  'object': (obj) => { return Array.isArray(obj) ? 'options' : 'params'; }
};

const registerEvents = [
  'server',
  'textserver',
  'textchannel',
  'textprivate'
];

class Bot extends EventEmitter {
  constructor(options = {}) {
    super();

    this.client = null;
    this.server = null;
    this.channel = null;
    this.commands = {};
    this.keepAlive = {
      handle: null,
      interval: 60000 // 60 seconds
    };

    const defaults = {
      sid:  process.env.TS3_SID  || '1',
      user: process.env.TS3_USER || 'serveradmin',
      pass: process.env.TS3_PASS || 'password',
      name: process.env.BOT_NAME || 'Woodhouse',
      channel: process.env.TS3_CHANNEL || 'Default Channel',
      host: process.env.TS3_HOST || '127.0.0.1',
      port: process.env.TS3_PORT || '10011',
      verbose: !!process.env.BOT_VERBOSE || false
    };

    this.options = Object.assign({}, defaults, options);

    this.ts3 = new TeamSpeak(this.options.host, this.options.port);

    this.logger = new Logger(this.options);

    this.logger.enableLogging(config.logging);
  }

  init() {
    const { callback } = this._args(arguments);

    this._login(err => {
      if (err) return callback(err);  

      this._join(err => {
        if (err) return callback(err);

        this._keepAlive();

        registerEvents.forEach(event => {
          this.logger.debug(`Registering for '${event}' notifications`);
          this.ts3.subscribe({ event });
        });

        this.on('textmessage', (context) => {
          if (context.invokeruid !== this.options.user) {
            const args = context.msg.replace(/\s+/g, ' ').trim().split(' ');

            if (Object.keys(this.commands).indexOf(args[0]) !== -1) {
              this.commands[args[0]].process(args, context);
            } else {
              this.emit('unknowncommand', context);
            }
          }
        });

        this.emit('ready');

        return callback();
      });
    });

    this.on('ready', () => {
      this.logger.success(`${this.options.name} is ready!`);      
    });

    this.on('clientmoved', (data) => {
      if (this.channel && data.channel && data.client && data.client.client_unique_identifier !== this.client.client_unique_identifier) {
        if (this.channel.cid === data.channel.cid) {
          this.emit('cliententerchannel', data);
        } else {
          this.emit('clientleftchannel', data);
        }
      }
    });

    this.ts3.on('notify', (event, resp) => {
      this.logger.debug(`Received notification for event: '${event}' with response:`, resp);

      const context = Object.assign({}, resp);
      const clientId = resp.invokerid || resp.clid || null;
      const channelId = resp.ctid || resp.cid || null;

      context.getClient = (callback) => {
        this.getChannelById(clientId, callback);
      };

      this.getClientById(clientId, (err, client) => {
        if (client) context.client = client;

        this.getChannelById(channelId, (err, channel) => {
          if (channel) context.channel = channel;

          this.emit(event, context);
        });
      });
    });
  }

  disconnect() {
    const { callback } = this._args(arguments);

    clearInterval(this.keepAlive.handle);
    this.ts3.disconnect();

    return callback();
  }

  shutdown() {
    const { callback } = this._args(arguments);

    this._query('serverprocessstop', (err, resp, req) => {
      if (err) return callback(err);

      return this.disconnect(callback);
    });
  }

  getServerGroupByName() {
    const { name, callback } = this._args(arguments, {
      'string': 'name'
    });

    this._query('servergrouplist', (err, resp, req) => {
      if (err) return callback(err);

      const filtered = resp.data.filter(group => group.name === name);

      if (filtered.length > 0) {
        return callback(null, filtered[0]);
      } else {
        return callback(`Unable to find server group: '${name}'`);
      }
    });
  }

  getServer() {
    const { callback } = this._args(arguments);
    
    this._query('serverinfo', (err, resp, req) => {
      if (err) return callback(err);

      const server = resp.data ? new Server({ bot: this, data: resp.data }) : null;

      return callback(null, server);
    });
  }

  getClientById() {
    const { clid, callback } = this._args(arguments, {
      'string': 'clid',
      'number': 'clid'
    });

    if (typeof clid !== 'number') {
      this.logger.debug('Cannot get client without a client id.');
      return callback();
    }
    
    this._query('clientinfo', { clid }, (err, resp, req) => {
      if (err) return callback(err);

      const client = resp.data ? new Client({ bot: this, data: resp.data, clid }) : null;

      if (client.client_unique_identifier !== this.client.client_unique_identifier) {
        this._query('clientdbfind', { pattern: client.client_unique_identifier, '-uid': '' }, (err, resp, req) => {
          if (err) return callback(err);

          client.cldbid = resp.data.cldbid;

          return callback(null, client);
        });
      } else {
        return callback(null, client);
      }
    });
  }

  getClientByName() {
    const { pattern, callback } = this._args(arguments, {
      'string': 'pattern'
    });

    this._query('clientfind', { pattern }, (err, resp, req) => {
      if (err) return callback(err);

      const clientId = Array.isArray(resp.data) ? resp.data[0].clid : resp.data.clid;

      this.getClientById(clientId, callback);
    });
  }

  getChannelById() {
    const { cid, callback } = this._args(arguments, {
      'string': 'cid',
      'number': 'cid'
    });

    if (!cid) {
      this.logger.debug('Cannot get channel without a channel id.');
      return callback();
    }
    
    this._query('channelinfo', { cid }, (err, resp, req) => {
      if (err) return callback(err);

      const channel = resp.data ? new Channel({ bot: this, data: resp.data, cid }) : null;

      return callback(null, channel);
    });
  }

  getChannelByName() {
    const { pattern, callback } = this._args(arguments, {
      'string': 'pattern'
    });

    this._query('channelfind', { pattern }, (err, resp, req) => {
      if (err) return callback(err);

      const channelId = Array.isArray(resp.data) ? resp.data[0].cid : resp.data.cid;

      this.getChannelById(channelId, callback);
    });
  }

  globalCommand(cmd, action) {
    this.command(cmd, action, config.constants.TextMessageTargetMode.TextMessageTarget_GLOBAL);
  }

  privateCommand(cmd, action) {
    this.command(cmd, action, config.constants.TextMessageTargetMode.TextMessageTarget_CLIENT);
  }

  clientCommand(cmd, action) {
    this.command(cmd, action, config.constants.TextMessageTargetMode.TextMessageTarget_CLIENT);
  }
  
  channelCommand(cmd, action) {
    this.command(cmd, action, config.constants.TextMessageTargetMode.TextMessageTarget_CHANNEL);
  }

  serverCommand(cmd, action) {
    this.command(cmd, action, config.constants.TextMessageTargetMode.TextMessageTarget_SERVER);
  }

  command(cmd, action, context) {
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

  sendCommand(msg, targetmode) {
    this.emit('textmessage', { msg, targetmode });
  }

  messageClient(target, msg) {
    this.message(target, msg, config.constants.TextMessageTargetMode.TextMessageTarget_CLIENT);
  }

  messageChannel(target, msg) {
    this.message(target, msg, config.constants.TextMessageTargetMode.TextMessageTarget_CHANNEL);
  }

  messageServer(msg) {
    this.message(this.options.sid, msg, config.constants.TextMessageTargetMode.TextMessageTarget_SERVER);
  }

  message(target, msg, context) {
    context = context || config.constants.TextMessageTargetMode.TextMessageTarget_CHANNEL;

    this._query('sendtextmessage', {
      targetmode: context,
      target: target,
      msg
    }, (err, resp, req) => {
      if (err) return this._error(err);

      this.logger.debug(`Sent message to target: ${target} with context: ${context} => '${msg}'`);
    });
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

  _login() {
    const { callback, params } = this._args(arguments);

    if (params) {
      if (params.user) {
        this.options.user = params.user;
      }

      if (params.pass) {
        this.options.pass = params.pass;
      }
    }

    const login_params = {
      client_login_name: this.options.user,
      client_login_password: this.options.pass
    };

    this.logger.log(`Attempting to login as user: ${this.options.user}`);

    this._query('login', login_params, (err, resp, req) => {
      if (err) callback(err);

      this.logger.log('Authenticated.');

      this._query('whoami', (err, resp, req) => {
        if (err) return callback(err);

        this.getClientById(resp.data.clid, (err, client) => {
          if (err) return callback(err);

          this.client = resp.data;

          this.logger.debug('Loaded bot client info:', this.client);

          this._use(err => {
            if (err) return callback(err);

            this._query('clientupdate', { client_nickname: this.options.name }, (err, resp, req) => {
              if (err) return callback(err);

              this.logger.debug(`Set bot name to: ${this.options.name}`);
        
              return callback();
            });
          });
        });
      });
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

      this.getServer((err, server) => {
        if (err) return callback(err);

        this.server = server;

        return callback();
      });
    });
  }

  _join() {
    const { callback, params } = this._args(arguments);

    if (params && params.channel) {
      this.options.channel = params.channel;
    }

    this.logger.log(`Attempting to find & join channel: ${this.options.channel}`);

    const channel_find_params = { pattern: this.options.channel };

    this._query('channelfind', channel_find_params, (err, resp, req) => {
      if (err) return callback(err);

      this.logger.log('Channel found.');
      
      this.getChannelById(resp.data.cid, (err, channel) => {
        if (err) return callback(err);

        this.ts3.subscribe({ event: 'channel', id: channel.cid });        

        this._query('clientmove', { clid: this.client.client_id, cid: channel.cid }, (err, resp, req) => {
          if (err && err.error_id && err.error_id === 770) {
            this.logger.warn(`Already member of channel: ${this.options.channel}`);
          } else if (err) {
            return callback(err);
          }

          this.channel = channel;

          this.logger.log('Channel joined.');

          this.emit('join', this.channel);

          return callback();
        });
      });
    });
  }

  _keepAlive() {
    this.keepAlive.handle = setInterval(() => {
      this.logger.debug(`Keep alive query request`);

      this._query('whoami', (err, resp, req) => {
        this.logger.debug(`Keep alive query response`);
      });
    }, this.keepAlive.interval);
  }

  _warn() {
    this.emit('warning', ...arguments);
    this.logger.warn(...arguments);
  }

  _error() {
    this.emit('failure', ...arguments);
    this.logger.error(...arguments);
  }
}

module.exports = Bot;