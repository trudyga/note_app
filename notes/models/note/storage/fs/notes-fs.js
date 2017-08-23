'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const log = require('debug')('notes:fs-model');

const Note = require('../../Note');

module.exports.create = function(key, title, body) {
    return notesDir().then(notesdir => {
        if (key.indexOf('/') >= 0)
            throw new Error(`Key ${key} cannot contain '/'`);
        let note = new Note(key, title, body);
        const writeTo = filePath(notesdir, note.key);
        const writeJSON = note.JSON;
        log(`WRITE ${writeTo} ${writeJSON}`);
        return new Promise((resolve, reject) => {
           fs.writeFile(writeTo, writeJSON, {encoding: 'utf-8'}, err => {
               if (err) reject(err);
               else resolve(note);
           });
        });
    });
};

module.exports.update = function (key, title, body) {
    return exports.keylist().then(keys => {
        if (keys.every(k => k !== key))
            throw Error(`Note ${key} doesn't exist`);
        else
            return exports.create(key, title, body);
    });
};

module.exports.read = function(key) {
    return notesDir().then(notesdir => readJSON(notesdir, key).then(note => {
        log(`READ ${notesdir}/${key} ${util.inspect(note)}`);
        return note;
    }));
};

module.exports.destroy = function (key) {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath(notesdir, key), err => {
                if (err) reject(err);
                else
                    resolve(key);
            });
        });
    });
};

module.exports.keylist = function() {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.readdir(notesdir, (err, files) => {
                if (err) reject(err);
                if (!files) files = [];
                resolve({notesdir, files});
            });
        });
    }).then(data => {
        log(`keylist dir=${data.notesdir} files=${util.inspect(data.files)}`);
        let notes = data.files.map(fname => {
            let key = path.basename(fname, '.json');
            log('About to READ ' + key);
            return readJSON(data.notesdir, key).then(note => {
                return note.key;
            });
        });
        return Promise.all(notes);
    });
};

module.exports.count = function() {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.readdir(notesdir, (err, files) => {
                if (err) throw err;
                if (!files) resolve(0);
                resolve(files.length);
            });
        });
    });
};

function notesDir() {
    let dir = path.join(__dirname, process.env.NOTES_FS_DIR || 'notes-fs-data');
    return new Promise((resolve, reject) => {
        ensureDir(dir).then(() => {
            resolve(dir);
        }).catch(err => {
            reject(err);
        });
        ensureDir(dir).then((data, error) => {
            if (error) throw error;
            else resolve(dir);
        });
    });
}

function ensureDir(path) {
    let promise = new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            // if dir doesn't exists
            if (err || !stats.isDirectory())
                fs.mkdir(path,(err) => {
                    // if was an error
                    if (err) reject(err);
                    resolve();
                });
            else
                resolve();
        });
    });
    return promise;
}

function filePath(notesdir, key) {
    return path.join(notesdir, key + ".json");
}

function readJSON(notesdir, key) {
    const readFrom = filePath(notesdir, key);
    return new Promise((resolve, reject) => {
        fs.readFile(readFrom, 'utf-8', (err, data) => {
            if (err) return reject(err);
            log('readJSON: ' + data);
            try {
                let note = Note.fromJSON(data);
                resolve(note);
            } catch(e) {
                reject(e);
            }
        });
    });
}