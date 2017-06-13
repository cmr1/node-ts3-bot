var key = '2024F08A-329F-1648-B2AC-84F127600627E084B644-BA26-4407-A95B-264772E329C8'

var gw2 = require('gw2-api');
var api = new gw2.gw2();
 
// Set storage system to RAM if no access to localStorage 
api.setStorage(new gw2.memStore());
 
// Get daily pve achievement names: 
api.getDailyAchievements().then(function (res) {
  if (!res.pve) {
    return;
  }
 
  var achievementIds = [];
 
  for (var i = 0, len = res.pve.length; i < len; i++) {
    achievementIds.push(res.pve[i].id);
  }
 
  return api.getAchievements(achievementIds);
}).then(function (res) {
  for (var i = 0, len = res.length; i < len; i++) {
    console.log(res[i].name);
  }
});
 
// Get all character names associated with an account. 
api.setAPIKey(key);
 
api.getCharacters().then(function (res) {
  for (var i = 0, len = res.length; i < len; i++) {
    // This API call just returns an array of string character names. 
    console.log(res[i]);
  }
});
 
// Get Character Details 
// api.getCharacters('Zojja').then(function (res) {
//   console.log(res);
// });