const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// enable sessions
app.use(session({
  secret: "somesecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 }
}));

app.use((req,res, next) => {
  if(!req.session.log) {
    req.session.log = false;
    req.session.loginName = false;
  }
  res.locals.error =  req.cookies.error || {error_message : false};
  res.clearCookie("error");
  res.locals.log = req.session.log;
  res.locals.loginName = req.session.loginName
  req.session.error = false;
  next();
})


app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);

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