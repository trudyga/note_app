'use strict';

let notes = [];
const Note = require('../../Note');


exports.create = function(key, title, body) {
    return new Promise((resolve, reject) => {
        notes[key] = (new Note(key,title,body));
        resolve(notes[key]);
    });
};

exports.update = function (key, title, body) {
    return exports.keylist().then(keys => {
        if (keys.every(k => k !== key))
            throw Error(`Note ${key} doesn't exist`);
        else
            return exports.create(key, title, body);
    });
};

exports.destroy = function (key) {
    return new Promise((resolve, reject) => {
        if (notes[key]) {
            delete notes[key];
            resolve(key);
        } else
            reject(`Note ${key} does not exist`);
    });
};

exports.keylist = function () {
    return new Promise((response, reject) => {
        response(Object.keys(notes));
    });
};

exports.count = function() {
    return new Promise((resolve, reject) => {
        response(notes.length);
    });
};

exports.read = function (key) {
    return new Promise((resolve, reject) => {
        if (notes[key])
            resolve(notes[key]);
        else
            reject(`Note ${key} does not exist`);
    });
};