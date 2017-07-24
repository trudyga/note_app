var express = require('express');
var router = express.Router();
const path = require('path');
let notes = require('../models/note/storage');

/* GET home page. */
router.get('/', function (req, res, next) {
  notes.keylist()
    .then(keylist => {
      "use strict";
      let keyPromises = [];

      for (let key of keylist) {
        keyPromises.push(
          notes.read(key).then(note => {
            return {key:note.key, title: note.title};
          })
        );
      }

      return Promise.all(keyPromises);
    })
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
    .catch(err =>{ console.error(err); next(err);});
});

module.exports = router;