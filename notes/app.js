var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const debug = require('debug')('note-app:app');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
let notes = require('./routes/notes');

var app = express();

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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/notes', notes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
