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
          });
          return SQNote.sync();
      });
};

exports.create = function (key, title, body) {
    return exports.connectDb().then(SQNote => {
        return SQNote.create({
            notekey: key,
            title: title,
            body: body
        });
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