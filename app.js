const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);


// Error Handlers

// Custom error handler middleware function that logs the error to the console and
// renders an "Error" view with a friendly message for the user
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// Middleware function that returns a 404 NOT FOUND HTTP status code and
// renders a "Page Not Found" view when the user navigates to a non-existent route
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('page_not_found', {
    title: 'Page Not Found'
  });
});

// Start the server and sync with the database
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
});
