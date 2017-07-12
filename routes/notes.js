let express = require('express');
let util = require('util');
let router = new express.Router();
let notes = require('../modules/notes-memory');

// get add note view
router.get('/add', (req, res, next) => {
  "use strict";
  res.render('noteedit.pug', {
    title: "Add a Note",
    docreate: true,
    notekey: "",
    note: undefined
  });
});

// save note
router.post('/save', (req, res, next) => {
  "use strict";
  let action = req.body.docreate;
  let key = req.body.notekey;
  let title = req.body.title;
  let body = req.body.body;
  console.log(`Action: ${action}, key: ${key}, title: ${title}, body: ${body}`);

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
    });
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
      res.render('noteView', {note: note});
    });
  }
});

router.get('/edit', (req, res, next) => {
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
        note: note
      })
    }).catch(err => next(err));
  }
});

router.get('/destroy', (req, res, next) => {
  "use strict";
  let key = req.query.key;
  if (!key)
    next(new Error(`Note key isn't defined`));
  else {
    notes.destroy(key).then(key => {
      console.log(`Note ${key} successfully deleted`);
      res.redirect('/');
    });
  }
});

router.use((err, req, res, next) => {
  "use strict";
  res.render('error',
    {
      message: err.message,
      error: {
        status: 500,
        stack: null
      }
    });
});

module.exports = router;