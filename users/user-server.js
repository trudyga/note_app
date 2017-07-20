'use strict';

const restify = require('restify');
const util = require('util');
const log = require('debug')('users:server');
const error = require('debug')('users:error');
const usersModel = require('./users-sequelize');

let server = restify.createServer({
    name: "User-Auth_Service",
    version: "0.0.1"
});

server.use(restify.authorizationParser());
server.use(check);
server.use(restify.queryParser());
server.use(restify.bodyParser({
    mapParams: true
}));

server.post('/create-user', (req, res, next) => {
    usersModel.create(req.params.username, req.params.password, req.params.provider,
    req.params.lastName, req.params.givenName, req.params.middleName, req.params.emails,
    req.params.photos)
      .then(result => {
          log('created ' + util.inspect(result));
          res.send(result);
          next(false);
      })
      .catch(err => {
          res.send(500, err);
          error(err.stack);
          next(false);
      });
});

server.post('/find-or-create', (req, res, next) => {
    usersModel.findOrCreate({
        id: req.params.username, username: req.params.username,
        password: req.params.password,
        provider: req.params.provider,
        familyName: req.params.familyName,
        givenName: req.params.givenName,
        middleName: req.params.middleName,
        emails: req.params.emails,
        photos: req.params.photos
    })
      .then(result => {
          res.send(result);
          next(false)
      })
      .catch(err => {
          res.send(500, err);
          error(err.stack);
          next(false);
      });
});

server.get('/find/:username', (req, res, next) => {
    usersModel.find(req.params.username)
      .then(user => {
          if (!user) {
              res.send(404, new Error("Did not find " + req.params.username));
          } else {
              res.send(user);
          }
      }).catch(err => {
        res.send(500, err);
        error(err.stack);
        next(false);
    });
});

server.del('/destroy/:username', (req, res, next) => {
    usersModel.destroy(req.params.username)
      .then(() => {res.send({}); next(false);})
      .catch(err => {
          res.send(500, err);
          error(err.stack);
          next(false);
      });
});

server.post('/passwordCheck', (req, res, next) => {
    usersModel.userPasswordCheck(req.params.username, req.params.password)
      .then(check => {res.send(check); next(false);})
      .catch(err => {
          res.send(500, err);
          error(err.stack);
          next(false);
      });
});

server.get('/list', (req, res, next) => {
    usersModel.listUsers()
      .then(userlist => {
          if (!userlist) userlist = [];
          res.send(userlist);
          next(false);
      })
      .catch(err => {
          res.send(500,err);
          error(err.stack);
          next(false);
      });
});

server.listen(process.env.PORT, "localhost", function () {
    log(server.name + ' listening at ' + server.url);
});

// Mimic API Key authentication

let apiKeys = [{
    user: 'them',
    key: 'D3ED43C0-VD43-DSD3-3D2O-3DFE0B3AEF'
}];

function check(req, res, next) {
    if (req.authorization) {
        let found = false;
        for (let auth of apiKeys) {
            if (auth.key === req.authorization.basic.password
            && auth.user === req.authorization.basic.username) {
                found = true;
                break;
            }
        }
        if (found) next();
        else {
            res.send(401, new Error("Not authenticated"));
            error('Failed authentication check' +
              util.inspect(req.authorization));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authentication Key'));
        error('NO AUTHORIZATION');
        next(false);
    }
}

