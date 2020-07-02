const express = require('express');

const router = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');

const User = require('../models/user');
// eslint-disable no-underscore-dangle
// eslint-disable-next-line no-unused-vars
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (error, hash) => {
    if (error) {
      res.status(500).json({
        error,
      });
    } else {
      User.find({ email: req.body.email })
        .exec()
        .then((users) => {
          if (users.length > 0) {
            res.status(409).json({
              error: 'Email already exists',
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            return user.save();
          }
          return users;
        })
        .then((user) => {
          res.status(201).json({
            _id: user._id,
            email: user.email,
          });
        })
        .catch((err) => {
          res.status(500).json({
            err,
          });
        });
    }
    return null;
  });
});

// eslint-disable-next-line no-unused-vars
router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({
          error: 'Auth Failed',
        });
      } else {
        bcrypt.compare(req.body.password, user.password, (error, result) => {
          if (error || !result) {
            res.status(401).json({
              error: 'Auth Failed',
            });
          } else {
            const token = jwt.encode(
              {
                _id: user._id,
                email: user.email,
              },
              process.env.JWT_KEY || 'sekret',
            );

            res.status(200).json(token);
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
});

module.exports = router;
