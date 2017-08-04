const express = require('express');
const path = require('path');
let favicon = require('serve-favicon');
const logger = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const debug = require('debug')('note-app:app');
const error = require('debug')('note-app:error');
const bodyParser = require('body-parser');
const session = require('express-session');
const LokiStore = require('connect-loki')(session);


const index = require('./routes/index');
let notes = require('./routes/notes');
let users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
debug(process.env.REQUEST_LOG_FILE);
if (process.env.REQUEST_LOG_FILE) {
    let logDirectory = path.join(__dirname, 'log');
    let filename = path.normalize(process.env.REQUEST_LOG_FILE);
    debug(`Log file: ${filename}`);
    // ensure log dir exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    let accessLogStream = rfs(process.env.REQUEST_LOG_FILE, {
        interval: '1d',
        path: logDirectory
    });
    debug("Create rotation file logger");
    app.use(logger(process.env.REQUEST_LOG_FORMAT ||
      'common', {stream: accessLogStream}));
}
else {
    app.use(logger('dev'));
}
debug("This is message from app");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// enable session support
app.use(session({
    store: new LokiStore({
        path: 'sessions/session-store.db',
        logErrors: (err) => error(err)
    }),
    secret: 'keyboard mouse',
    saveUninitialized: true,
    resave: true
}));
users.initPassport(app);

//configure vendors
app.use('/vendor/bootstrap', express.static(
  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/vendor/jquery', express.static(
  path.join(__dirname, 'node_modules', 'jquery', 'dist')));


app.use('/', index);
app.use('/notes', notes);
app.use('/users', users.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).render('error');
});

module.exports = app;
