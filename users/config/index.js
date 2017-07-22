const fs = require('fs');
const jsYaml = require('js-yaml');


let path = process.env.API_CONFIG;

module.exports.get = function (path) {
    return new Promise((resolve, reject) => {
        if (!path) path = process.env.API_CONFIG;
        return fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    }).then(yamltext => jsYaml.safeLoad(yamltext, 'utf-8'));
};

module.exports.getUsers = function (path) {
  return exports.get(path).then(config => config.api.users);
};

module.exports.getUser = function (name, path) {
    return exports.getUsers(path)
        .then(users => {
            "use strict";
            for (let user of users) {
                if (user.name === name)
                    return user;
            }
            return undefined;
        });
};