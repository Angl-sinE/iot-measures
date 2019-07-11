var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
let winstonLog = require('./config/winston');
let morgan = require('morgan');



var app = express();

var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var cosRouter = require('./routes/cos');
var measuresRouter = require('./routes/measures');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//logging
app.use(morgan('combined'));
app.use(morgan("common", { stream: winstonLog.stream }))

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/cos', cosRouter);
app.use('/measures',measuresRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
