/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth');
const addUserInfo = require('../middleware/add-user-info');
const Category = require('../models/category');
const Post = require('../models/post');

router.get('/', addUserInfo, (req, res, next) => {
  Post.find()
    .select('-__v')
    .exec()
    .then((posts) => {
      let filteredPosts = posts;
      // this posts will be always in the response
      filteredPosts = posts.filter((post) => post.status === 'public'); // public should be a constant
      if (!req.user) { // not a logged user, show only public posts
        res.json({ posts: filteredPosts });
      } else { // remove all draft posts that I shouldn't see, remove all private posts (I can do this in more elegant ways, with a middleware or with a sequelize query but it/s 255 am)
        const myPosts = posts.filter((post) => post.owner === req.user._id);
        res.json({ posts: filteredPosts.concat(myPosts).reverse() });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  Post.findById(id)
    .select('-__v')
    .exec()
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          error: 'Post Not Found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post('/', checkAuth, (req, res, next) => {
  const categoryid = req.body.categoryId;
  if (!categoryid) {
    const post = new Post({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      content: req.body.content,
      owner: req.user._id,
      category: categoryid,
    });
    post.save().then((post) => res.status(201).json(post));
    return;
  }
  Category.findById(categoryid)
    .then((category) => {
      if (category) {
        const post = new Post({
          _id: new mongoose.Types.ObjectId(),
          title: req.body.title,
          content: req.body.content,
          category: categoryid,
        });
        return post.save();
      }
      return res.status(404).json({
        error: 'Category Not Found',
      });
    })
    .then((post) => res.status(201).json(post))
    .catch((error) => res.status(500).json({
      error,
    }));
});

router.put('/:id', checkAuth, (req, res, next) => { // update a post
  const { id } = req.params;

  Post.update({ _id: id }, { $set: req.body })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  const { id } = req.params;

  Post.findOneAndRemove({ _id: id })
    .exec()
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          error: 'Post Not Found',
        });
      }
    })
    .catch((error) => {
      res.status(404).json({
        error,
      });
    });
});

module.exports = router;
