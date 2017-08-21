#!/usr/bin/env node

const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');

const passportSocketIo = require('passport.socketio'),
  http = require('http'),
  log = require('debug')('note-app:server'),
  error = require('debug')('note-app:error');

const sessionDir = process.env.NOTES_SESSIONS_DIR ?
    process.env.NOTES_SESSIONS_DIR: "sessions";
const session = require('express-session'),
  LokiStore = require('connect-loki')(session),
  sessionCookie = 'notes.sid',
  sessionSecret ='keyboard mouse',
  sessionStore = new LokiStore({
      path: sessionDir + "/session-store.db"
  });

const express = require('express'),
  cookieParser = require('cookie-parser'),
  app = express(),
  server = http.createServer(app),
  io = require('socket.io')(server);

const index = require('./routes/index'),
  notes = require('./routes/notes'),
  users = require('./routes/users');

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: sessionCookie,
    secret: sessionSecret,
    store: sessionStore
}));

const port = normalizePort(process.env.PORT || '3000');
/**
 * Normalize a port into a number, string, or false.
 */

app.set('port', port);

app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    key: sessionCookie,
    resave: true,
    saveUninitialized: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
log(process.env.REQUEST_LOG_FILE);
if (process.env.REQUEST_LOG_FILE) {
    let logDirectory = path.join(__dirname, 'log');
    let filename = path.normalize(process.env.REQUEST_LOG_FILE);
    log(`Log file: ${filename}`);
    // ensure log dir exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    let accessLogStream = rfs(process.env.REQUEST_LOG_FILE, {
        interval: '1d',
        path: logDirectory
    });
    log("Create rotation file logger");
    app.use(logger(process.env.REQUEST_LOG_FORMAT ||
      'common', {stream: accessLogStream}));
}
else {
    app.use(logger('dev'));
}

// configure parsers
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

// configure vendors
app.use('/vendor/bootstrap', express.static(
  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/vendor/jquery', express.static(
  path.join(__dirname, 'node_modules', 'jquery', 'dist')));

// configure routes
app.use('/', index);
index.socketio(io);
app.use('/notes', notes);
notes.socketio(io);
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

server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    log('Listening on ' + bind);
}

