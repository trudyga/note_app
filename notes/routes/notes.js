const express = require('express');
const util = require('util');
const router = new express.Router();
const path = require('path');
// let notes = require('../models/notes-memory');
const usersRouter = require('./users');
let notes = require('../models/note/storage');
let log = require('debug')('note-app:routes:notes');

// get add note view
router.get('/add', usersRouter.ensureAuthenticated, (req, res, next) => {
    "use strict";
    res.render('noteedit.pug', {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        note: undefined,
        breadcrumbs: [
            { href: '/', text: 'Home'},
            { active: true, text: 'Add Note'}
        ],
        hideAddNote: true
    });
});

// save note
router.post('/save', usersRouter.ensureAuthenticated, (req, res, next) => {
    "use strict";
    let action = req.body.docreate;
    let key = req.body.notekey;
    let title = req.body.title;
    let body = req.body.body;
    log(`Action: ${action}, key: ${key}, title: ${title}, body: ${body}`);
    log(`Action: ${action}, key: ${key}, title: ${title}, body: ${body}`);

    let done;

    if (key && title && body)
    {
        if (action === 'create') {
            done = notes.create(key, title, body);
        }
        else {
            done = notes.update(key, title, body);
        }
        done.then(note => {
            res.redirect(`/notes/view?key=${req.body.notekey}`);
        }).catch(err => next(err));
    }
    else
        res.status(400).send("Incorrect request body, not all fields specified!");
});

router.get('/view', (req, res, next) => {
    "use strict";
    let key = req.query.key;
    if (!key)
        next(new Error(`Note key isn't defined`));
    else {
        notes.read(key).then(note => {
            res.render('noteView',
              {
                  note: note,
                  user: req.user ? req.user: undefined,
                  notekey: req.query.key,
                  breadcrumbs: [
                      {href: '/', text: 'Home'},
                      {active: true, text: note.title}
                  ]
              });
        }).catch(err => next(err));
    }
});

router.get('/edit', usersRouter.ensureAuthenticated, (req, res, next) => {
    "use strict";
    let key = req.query.key;
    if (!key)
        next(new Error(`Note key isn't defined`));
    else {
        notes.read(key).then(note => {
            res.render('noteedit', {
                title: note ? ("Edit " + note.title) : "Add a Note",
                docreate: false,
                notekey: req.query.key,
                note: note,
                hideAddNote: true,
                user: req.user ? req.user: undefined,
                breadcrumbs: [
                    {href: '/', text: 'Home'},
                    {active: true, text: 'Delete Note'}
                ]
            });
        }).catch(err => next(err));
    }
});

router.get('/destroy', usersRouter.ensureAuthenticated, (req, res, next) => {
    "use strict";
    notes.read(req.query.key)
      .then(note => {
          res.render('notesdestroy', {
              title: note ? note.title: '',
              notekey: req.query.key,
              note: note,
              user: req.user
          });
      })
      .catch(err => next(err));
});

router.post('/destroy/confirm', usersRouter.ensureAuthenticated, (req, res, next) => {
    "use strict";
    notes.destroy(req.body.notekey)
      .then(() => {
        log(`Note ${req.body.notekey} successfully deleted`);
        res.redirect('/');
      })
      .catch(err => next(err));
});


router.use((err, req, res, next) => {
    "use strict";
    res.render('error',
      {
          message: err.message,
          error: {
              status: 500,
              stack: err.stack
          }
      });
});

module.exports = router;

module.exports.socketio = function (io) {
    let viewNamespace = io.of('/view');
    let forNoteViewClients = function (cb) {
        viewNamespace.clients((err, clients) => {
            "use strict";
            if (err) throw err;
            clients.forEach(id => {
                cb(viewNamespace.connected[id])
            });
        });
    };

    notes.events.on('noteupdate', newnote => {
        "use strict";
        log(`Emit NOTEUPDATE event`);
        forNoteViewClients(socket => {
            log(`Emit NOTEUPDATE event on socket with data ${util.inspect(newnote)}`);
            socket.emit('noteupdate', {
                key: newnote.notekey,
                title: newnote.title,
                body: newnote.body
            });
        });
    });

    notes.events.on('notedestroy', data => {
        "use strict";
        log(`Emin NOTEDESTROY event`);
        forNoteViewClients(socket => {
            log(`Emit NOTEDESTROY event on socket with data ${util.inspect(data)}`);
            socket.emit('notedestroy', {
                key: data,
            });
        });
    });
};