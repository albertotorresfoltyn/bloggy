const express = require('express');

const app = express();

// Dependencies
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Routes
const authRoutes = require('./api/routes/auth');
const categoriesRoute = require('./api/routes/categories');
const postsRoute = require('./api/routes/posts');

// Mongoose Config --should go in a file
mongoose.connect('mongodb://127.0.0.1:27017/megablog');
mongoose.Promise = global.Promise; // avoid deprecation warning

// Config -- basic,
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS -- Primitive as a 5 years old app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
  return null;
});

// Routing Config -- separated file(s)
app.use('/auth', authRoutes);
app.use('/categories', categoriesRoute);
app.use('/posts', postsRoute);

// If none of the above routes match --opsie
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// Global Error Handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;
