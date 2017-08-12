const Sequelize = require('sequelize'),
  jsyaml = require('js-yaml'),
  fs = require('fs'),
  util = require('util'),
  EventEmitter = require('events');

class MessageEmitter extends EventEmitter {}

const log = require('debug')('note-app:model-messages'),
  error = require('debug')('note-app:error');

let SQMessages;
let sequelz;

module.exports = new MessageEmitter();

let connectDB = function () {
    if (SQMessages) return SQMessages.sync();

    return new Promise((resolve, reject) => {
        "use strict";
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    }).then(yamlText => jsyaml.safeLoad(yamlText, 'utf-8'))
      .then(config => {
          "use strict";
          if (!sequelz) sequelz = new Sequelize(config.dbname, config.username, config.password, config.params);

          if (!SQMessages) SQMessages = sequelz.define('Message', {
              id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false},
              from: {
                  type: Sequelize.STRING,
                  allowNull: false
              },
              namespace: {
                  type: Sequelize.STRING,
                  allowNull: false
              },
              message: {
                  type: Sequelize.STRING(1024),
                  allowNull: false
              },
              timestamp: {
                  type: Sequelize.DATE,
                  allowNull: false
              }
          });

          return SQMessages.sync();
      });
};

/**
 * Add message to the DB
 * @param from
 * @param namespace
 * @param message
 * @returns {Promise.<TResult>}
 */
module.exports.postMessage = function(from, namespace, message) {
    "use strict";
    return connectDB()
      .then(SQMessages => SQMessages.create({
          from,
          namespace,
          message,
          timestamp: Date.now()
      }))
      .then(newMsg => {
          let toEmit = {
              id: newMsg.id,
              from: newMsg.from,
              namespace: newMsg.namespace,
              message: newMsg.message,
              timestamp: newMsg.timestamp
          };

          module.exports.emit('newmessage', toEmit);
          return toEmit;
      });
};

/**
 * Destroys message from the database by id
 * @param id
 * @param namespace
 * @returns {Promise.<TResult>}
 */
module.exports.destroyMessage = function(id, namespace) {
    "use strict";
    return connectDB()
      .then(SQMessages => SQMessages.find({where: {id}}))
      .then(msg => msg.destroy())
      .then(() => {
        module.exports.emit('destroymessage', {
            id,
            namespace
        });
        return {id, namespace};
      });
};

/**
 * Remove all messages from specified namespace
 * @param namespace {String} Namespace title where all messages will be deleted
 * @returns {Promise.<Array<String>, String>} Pair of namespace and deleted ids
 */
module.exports.destroyNamespace = function (namespace) {
    let ids = [];
    return connectDB()
      .then(SQMessages => SQMessages.findAll({where: {namespace}}))
      .then(msgs => {
          "use strict";
          msgs.forEach(msg => ids.push(msg.id));
          return msgs;
      })
      .then(msgs => Promise.all(msgs.map(msg => msg.destroy())))
      .then(() => {
        "use strict";
        return {ids, namespace};
      });
};

/**
 * Returns the most recent 20 messages with given namespace
 * @param namespace
 * @returns {Promise.<TResult>}
 */
module.exports.recentMessages = function (namespace) {
    return connectDB()
      .then(SQMessages => SQMessages.findAll({
          where: {namespace: namespace},
          order: 'timestamp DESC',
          limit: 20
      }))
      .then(messages => {
          "use strict";
          return messages.map(msg => {
              return {
                  id: msg.id,
                  from: msg.from,
                  namespace: msg.namespace,
                  message: msg.message,
                  timestamp: msg.timestamp
              };
          });
      });
};


