const gw2 = require('gw2-api');
const VerifyBot = require('./src/VerifyBot');

const api = new gw2.gw2();

api.setStorage(new gw2.memStore());

const bot = new VerifyBot();

bot.on('connected', () => console.log('connected'));
bot.on('ready', () => console.log('ready'));

bot.cmd('whoami', (args, data) => {
  data.user.getInfo().then(data => data.user.respond(JSON.stringify(data, null, 2)));
});

bot.cmd('hi', (args, data) => {
  data.user.respond('Hello', data.user.get('name'));
});

bot.cmd('verify', (args, data) => {
  api.setAPIKey(args[0]);

  api.getAccount().then(res => {
    if (res) {
      data.user.respond('Account Info:\n', JSON.stringify(res, null, 2));      
    } else {
      data.user.respond('No Account Info found');
    }
  }).catch(err => bot.error(err));
});

    // this.api.setStorage(new gw2.memStore());

// this.api.setAPIKey(data.msg);

//     this.api.getAccount().then(function(res) {
//       console.log(JSON.stringify(res, null, 2));
//     });
 
//     this.api.setAPIKey(data.msg);

//     this.api.getCharacters().then(function (res) {
//       for (var i = 0, len = res.length; i < len; i++) {
//         // This API call just returns an array of string character names. 
//         console.log(res[i]);
//       }
//     });
// const bot = new Alfred();

// bot.login('serveradmin', 'abc123')
// 	.then(() => console.log('Connected!'))
//   .then(() => bot.send('servernotifyregister', { 'event': 'server' }))
//   .then(() => bot.send('servernotifyregister', { 'event': 'textprivate' }))
//     .catch(err => console.error(err));

// bot.use(User);

// // bot.on('cliententerview', data => console.log(data.client_nickname, 'connected!'));
// bot.on('cliententerview', data => data.user.respond('Hello', data.user.get('name')) );

// bot.on('textmessage', data => data.user.poke(data.msg));
