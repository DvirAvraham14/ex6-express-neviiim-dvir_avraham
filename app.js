const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// Import the different route handlers
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const apiRouter = require('./routes/reset_api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// enable database session store
const Sequelize = require('sequelize')
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sequelize = new Sequelize({
  "dialect": "sqlite",
  "storage": "./session.sqlite"
});


const myStore = new SequelizeStore({
  db: sequelize
})


// enable sessions
app.use(session({
  secret:"somesecretkey",
  store:myStore,
  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 10*60*1000 } // milliseconds!
}));

myStore.sync();

// Set cache control headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});


// Check if the user is logged in and if not, redirect to login page
app.use((req, res, next) => {
  // Only allow request path that starts with /login, /register or any routes that come after them
  if (!req.session.log && !/^\/(login|register)[/a-z]*/.test(req.path)) {
    res.redirect('/login');
    return;
  }
  next();
});


//Initialize login state if not already present in session
app.use((req,res, next) => {

  // Set error cookie to be available to all views
  res.locals.error =  req.cookies.error || {error_message : false};
  res.clearCookie("error");
  res.locals.log = req.session.log;
  res.locals.loginName = req.session.loginName
  req.session.error = false;
  next();
})


// Use the different route handlers for their respective routes
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = "Error";

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
