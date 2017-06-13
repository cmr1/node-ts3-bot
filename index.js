const VerifyBot = require('./src/VerifyBot');

const bot = new VerifyBot();

bot.on('connected', () => console.log('connected'));
bot.on('ready', () => console.log('ready'));


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
