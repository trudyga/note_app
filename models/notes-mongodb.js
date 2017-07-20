'use strict';

const util = require('util');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const log = require('debug')('notes:mongodb-model');
const error = require('debug')('notes:error');
const Note = require('./Note');

let db;

exports.connectDb = function () {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        // Connection URL
        let url = process.env.MONGO_URL;
        // Use connect method to connect to the Server
        MongoClient.connect(url, (err, _db) => {
            if (err) reject(err);
            db = _db;
            resolve(_db);
        });
    });
};

exports.create = function (key, title, body) {
    return exports.connectDb()
      .then(db => {
          let note = new Note(key, title, body);
          let collection = db.collection('notes');
          return collection.insertOne({
              notekey: key,
              title: title,
              body: body
          }).then( result => {return note;});
      });
};

exports.update = function(key, title, body) {
    return exports.connectDb()
      .then(db => {
          let note = new Note(key, title, body);
          let collection = db.collection('notes');
          return collection.updateOne({notekey: key}, {
              $set: {title: title, body: body}
            }
          ).then(result => {return note;});
      });
};

exports.read = function(key) {
    return exports.connectDb()
      .then(db => {
          let collection = db.collection('notes');
          return collection.findOne({notekey: key})
            .then(doc => {
                return new Note(doc.notekey, doc.title, doc.body);
            });
      });
};

exports.destroy = function (key) {
    return exports.connectDb()
      .then(db => {
          let collection = db.collection('notes');
          return collection.findOneAndDelete({notekey: key});
      });
};

exports.keylist = function () {
    return exports.connectDb()
      .then(db => {
          let collection = db.collection('notes');
          return new Promise( (resolve, reject) => {
              let keys = [];
              collection.find({}).forEach(note => keys.push(note.notekey),
              err => {
                  if (err) reject(err);
                  else resolve(keys);
              });
          });
      });
};

exports.count = function () {
    return exports.connectDb()
      .then(db => {
          let collection = db.collection('notes');
          return new Promise((resolve, reject) => {
              collection.count({}, (err, count) => {
                  if (err) reject(err);
                  else
                      resolve(err);
              });
          });
      });
};