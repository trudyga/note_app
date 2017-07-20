'use strict';

const util = require('util');
const sqlite3 = require('sqlite3');

const log = require('debug')('notes:sqlite3-model');
const error = require('debug')('notes:error');

const Note = require('./Note');

sqlite3.verbose();

let db; // store the db connection here

exports.connectDb = function() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        let dbFile = process.env.SQLITE_FILE || "notes.sqlite3";
        db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        err => {
            if(err) reject(err);
            else {
                log('Opened SQLite 3 database ' + dbFile);
                resolve(db);
            }
        });
    });
};

// TODO Continue sqlite example