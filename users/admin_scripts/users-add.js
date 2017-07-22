'use strict';

const util = require('util');
const config = require('../config');
const restify = require('restify');

let client = restify.createJsonClient({
    url: 'http://localhost:'+process.env.PORT,
    version: '*'
});


config.getUser('notes_app', '../config/api-config.yaml')
    .then(user => {
        if (!user) throw new Error("User is not defined: " + user.name);

        client.basicAuth(user.name, user.key);

        client.post('/create-user', {
            username: 'me', password: 'w0rd', provider: 'local',
            familyName: 'Einarrstod', givenName: 'Ashildr',
            middleName: '', emails: [], photos: []
        }, function(err, req, res, obj) {
            if (err) console.error(err.stack);
            else console.log('Created ' + util.inspect(obj));
        });
    })
    .catch(err => console.error(util.inspect(err)));