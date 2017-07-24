'use strict';
const restify = require('restify');
const util = require('util');
const config = require('../config');


let client = restify.createJsonClient({
    url: 'http://localhost:' + process.env.PORT || '3333',
    version: '*'
});

config.getUser('users-admin', '../config/api-config.yaml')
  .then(user => {
      //authenticate as users admin
      client.basicAuth(user.name, user.key);

      // get users list
      client.get('/list', (err, req, res, obj) => {
          "use strict";
          if (err) {
              console.error("Error when retrieving users list: " + err);
          }

          console.log(util.inspect(obj));
      });
  })
  .catch(err => {
      console.log(err);
  });
