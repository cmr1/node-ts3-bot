var list = {
  cid: [0, 1, 3, 5, 7],
  order: [1, 4, 5, 2, 3],
  name: ['ch0', 'ch1', 'ch3', 'ch5', 'ch7']
};

var arr = {};

list.cid.forEach((cid, index) => {
  arr[cid] = {}
});

Object.keys(list).forEach(key => {
  const val = list[key];

  if (Array.isArray(val)) {
    val.forEach((v, i) => {

    });
  }
});

// var gw2 = require('gw2-api');
// var api = new gw2.gw2();
 
// // Set storage system to RAM if no access to localStorage 
// api.setStorage(new gw2.memStore());
 
// // Get daily pve achievement names: 
// api.getDailyAchievements().then(function (res) {
//   if (!res.pve) {
//     return;
//   }
 
//   var achievementIds = [];
 
//   for (var i = 0, len = res.pve.length; i < len; i++) {
//     achievementIds.push(res.pve[i].id);
//   }
 
//   return api.getAchievements(achievementIds);
// }).then(function (res) {
//   for (var i = 0, len = res.length; i < len; i++) {
//     console.log(res[i].name);
//   }
// });
 
// // Get all character names associated with an account. 
// api.setAPIKey(key);
 
// api.getCharacters().then(function (res) {
//   for (var i = 0, len = res.length; i < len; i++) {
//     // This API call just returns an array of string character names. 
//     console.log(res[i]);
//   }
// });
 
// Get Character Details 
// api.getCharacters('Zojja').then(function (res) {
//   console.log(res);
// });
// async.each(watchQueries, (query, next) => {
              //   const listQuery = query + 'list';
              //   const infoQuery = query + 'info';

              //   this._query(listQuery, (err, resp, req) => {
              //     if (err) return next(err);

              //     if (resp && resp.data && Array.isArray(resp.data)) {
              //       this.state[query] = resp.data;
              //       return next();
              //     } else {
              //       return next(`Unable to watch query: '${query}' (bad response data)`);
              //     }
              //   });
              // }, err => {
              //   this.emit('ready');

              //   return callback(err);
              // });