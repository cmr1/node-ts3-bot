'use strict';

const async = require('async');
const expect = require('chai').expect;

const config = require('../config');

const Bot = require('../');

describe('Bot', function () {
  const bot = new Bot({
    quiet: true
  });

  before(function (done) {
    bot.init();

    bot.on('ready', done);
  });

  after(function (done) {
    bot.shutdown(done);
  });

  it('should exist', function () {
    expect(Bot).to.exist;
  });

  describe('supports commands without arguments', function() {
    const testCommand = 'noargs';

    Object.keys(config.constants.TextMessageTargetMode).forEach(type => {
      it('context: ' + type, function(done) {
        const mode = config.constants.TextMessageTargetMode[type];
        const command = `${testCommand}-${mode}`;

        bot.command(command, (args, context) => {
          expect(args).to.be.an('array');
          expect(args.length).to.equal(1);
          expect(args[0]).to.equal(command);
          done();
        }, mode);
  
        bot.sendCommand(`${command}`, mode);    
      });
    });
  });

  describe('supports commands with arguments', function() {
    const testCommand = 'withargs';

    Object.keys(config.constants.TextMessageTargetMode).forEach(type => {
      it('context: ' + type, function(done) {
        const mode = config.constants.TextMessageTargetMode[type];
        const command = `${testCommand}-${mode}`;

        const sendArgs = [];

        for (let i=0; i<Math.floor(Math.random()*10)+1; i++) {
          sendArgs.push(`arg-${i}`);
        }

        bot.command(command, (args, context) => {
          expect(args).to.be.an('array');
          expect(args.length).to.equal(sendArgs.length + 1);
          expect(args[0]).to.equal(command);
          args.shift();
          expect(args).to.eql(sendArgs);
          done();
        }, mode);
  
        bot.sendCommand(`${command} ${sendArgs.join(' ')}`, mode);    
      });
    });
  });
});
