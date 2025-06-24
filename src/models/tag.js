const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    title: String,
});

const Tag = mongoose.model('tag', tagSchema);

module.exports = Tag;
