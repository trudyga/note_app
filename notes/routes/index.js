var express = require('express');
var router = express.Router();
const path = require('path');
let notes = require('../models/note/storage');
const log = require('debug')('note-app:router:index');
const error = require('debug')('note-app:error');

let getKeyTitlesList = function () {
    notes.keylist()
      .then(keylist => {
          "use strict";
          let keyPromises = [];

          for (let key of keylist){
              keyPromises.push(
                notes.read(key).then(note => {
                    return {key: note.key, title: note.title};
                })
              )
          }

          return Promise.all(keyPromises);
      });
}

/* GET home page. */
router.get('/', function (req, res, next) {
    getKeyTitlesList()
    .then(notelist => {
      "use strict";
      res.render('index.pug', {
          title: 'Notes',
          notelist: notelist,
          user: req.user ? req.user : undefined,
          breadcrumbs: [
              { href: '/', text: 'Home'}
          ]
      });
    })
    .catch(err =>{ error(err); next(err);});
});

module.exports.socketio = function (io) {
    let emitNoteTitles = () => {
        "use strict";
        getKeyTitlesList().then(notelist => {
            io.of('/home').emit('notetitles', notelist);
        });
    };

    notes.events.on('notecreated', emitNoteTitles);
    notes.events.on('noteupdate', emitNoteTitles);
    notes.events.on('notedestroy', emitNoteTitles);
};

module.exports = router;