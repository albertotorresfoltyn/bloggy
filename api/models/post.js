const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'public', 'private'], default: 'draft' },
  owner: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
});

module.exports = mongoose.model('Post', postSchema);
