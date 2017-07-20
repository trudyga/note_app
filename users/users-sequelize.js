'use strict';

const Sequelize = require('sequelize');
const jsyaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
const log =require('debug')('users:model-users');
const error = require('debug')('users:error');

let SQUser;
let sequlz;

// TODO Add password encryption

exports.connectDb = function () {
    if (SQUser) return SQUser.sync();

    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf-8',
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          })
    }).then(yamltext => {
        return jsyaml.safeLoad(yamltext, 'utf-8');
    }).then(config => {
        if (!sequlz) sequlz = new Sequelize(
          config.dbname, config.username, config.password,
          config.params
        );

        SQUser = sequlz.define('users', {
            username: {
                type: Sequelize.STRING,
                primaryKey: true,
                unique: true,
                required: true,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: false
            },
            familyName: Sequelize.STRING,
            givenName: Sequelize.STRING,
            middleName: Sequelize.STRING,
            emails: Sequelize.STRING(2048),
            photos: Sequelize.STRING(2048)
        });

        return SQUser.sync();
    });
};

exports.create = function (username, password, provider, familyName, givenName, middleName, emails, photos) {
    return exports.connectDb().then(db => {
        return SQUser.create({
            username: username,
            password: password,
            provider: provider,
            familyName: familyName,
            givenName: givenName,
            middleName: middleName,
            emails: JSON.stringify(emails),
            photos: JSON.stringify(photos)
        });
    });
};

exports.update = function (username, password, provider, familyName, givenName, middleName, emails, photos) {
    return exports.find({where: {username: username}})
      .then(user => {
          return user ? user.updateAttributes({
              password: password,
              provider: provider,
              familyName: familyName,
              givenName: givenName,
              middleName: middleName,
              emails: JSON.stringify(emails),
              photos: JSON.stringify(photos)
          }) : undefined;
      });
};

exports.find = function (username) {
    log('find ' + username);
    return exports.connectDb().then(SQUser => {
        return SQUser.find({where: {username: username}});
    }).then(user => user ? exports.sanitizedUser(user): undefined);
};

exports.destroy = function (username) {
    return exports.connectDb().then(SQUser => {
        return SQUser.find({where: {username: username}});
    }).then(user => {
        if (!user) throw new Error('Did not find requested ' + username + ' to delete');
        return user.destroy();
    });
};

exports.userPasswordCheck = function (username, password) {
    return exports.connectDb().then(SQUser => {
        return SQUser.find({where: {username: username}});
    }).then(user => {
        if (!user) {return {
            check: false,
            username: username,
            message: "Could not find user"
        };
        } else if (user.username === username
          && user.password === password) {
            return {
                check: true,
                username: username
            };
        } else {
            return {
                check: false,
                username: username,
                mesage: "Incorrect password"
            };
        }
    });
};

exports.findOrCreate = function (profile) {
    return exports.find(profile.id).then(user => {
        if (user) return user;
        return exports.create(profile.id, profile.password,
        profile.provider, profile.familyName,
        profile.givenName, profile.middleName,
        profile.emails, profile.photos);
    });
};

exports.listUsers = function() {
    return exports.connectDb()
      .then(SQUser => SQUser.findAll({}))
      .then(userlist => userlist.map(user => exports.sanitizedUser(user)))
      .catch(err => error(err));
};

exports.sanitizedUser = function (user) {
    return {
        id: user.username,
        password: user.password,
        provider: user.provider,
        familyName: user.familyName,
        givenName: user.givenName,
        middleName: user.middleName,
        emails: user.emails,
        photos: user.photos
    };
};