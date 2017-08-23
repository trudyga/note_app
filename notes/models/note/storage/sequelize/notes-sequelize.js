'use strict';
const util = require('util');
const fs = require('fs');
const jsyaml = require('js-yaml');
const Sequelize = require('sequelize');
const log = require('debug')('notes:sequelize-model');
const error = require('debug')('notes:error');
const Note = require('../../Note');


exports.connectDb = function () {
    let SQNote;
    let sequlz;

    if (SQNote) return SQNote.sync();

    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
      .then(yamltext => {
          return jsyaml.safeLoad(yamltext, 'utf-8');
      })
      .then(params => {
          sequlz = new Sequelize(params.dbname, params.username,
            params.password, params.params);
          SQNote = sequlz.define('Note', {
              notekey: {
                  type: Sequelize.STRING,
                  primaryKey: true,
                  unique: true,
                  allowNull: false
              },
              title: {
                  type: Sequelize.STRING,
                  allowNull: false
              },
              body: {
                  type: Sequelize.TEXT,
                  allowNull: false
              }
          }, {
              charset: 'utf8',
              collate: 'utf8_unicode_ci'
          });
          return SQNote.sync();
      });
};

/**
 * Add note entry to database
 * @param key {String} Key to add only ascii characters
 * @param title {String} Note's title, only ascii characters
 * @param body {String} Note's body, only ascii characters
 * @returns {Promise.<Note>} Return created note instance
 */
exports.create = function (key, title, body) {
    return exports.connectDb().then(SQNote => {
        return SQNote.create({
            notekey: key,
            title: title,
            body: body
        });
    }).then(newNote => {
        exports.events.noteCreated(newNote);
        return newNote;
    });
};

exports.update = function (key, title, body) {
    return exports.connectDb().then(SQNote => {
        return SQNote.find({where: {notekey: key}})
          .then(note => {
              if (!note) {
                  throw new Error("No note found for key " + key);
              } else {
                  return note.updateAttributes({
                      title: title,
                      body: body
                  });
              }
          });
    }).then(updatedNote => {
        exports.events.noteUpdate(updatedNote);
        return updatedNote;
    });
};

exports.read = function (key) {
    return exports.connectDb().then(SQNote => {
        return SQNote.find({where: {notekey: key}})
          .then(note => {
              if (!note) {
                  throw new Error("No note found for key " + key);
              } else {
                  return new Note(note.notekey, note.title, note. body);
              }
          });
    });
};

exports.destroy = function (key) {
    return exports.connectDb().then(SQNote => {
        SQNote.find({where: {notekey: key}})
          .then(note => {
              if (!note){
                  throw new Error("No note found for key " + key);
              } else {
                  return note.destroy();
              }
          });
    }).then(() => key).then(deletedNote => {
        exports.events.noteDestroy(deletedNote);
        return deletedNote;
    });
};

exports.keylist = function () {
    return exports.connectDb().then(SQNote => {
        return SQNote.findAll({attributes: ['notekey']})
          .then(notes =>
            notes.map(note => note.notekey)
          );
    });
};

exports.count = function () {
    return exports.connectDb().then(SQNote => {
        SQNote.count().then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};

exports.events = require('../../note-events');