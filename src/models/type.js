const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    title: String,
});

const Type = mongoose.model('type', typeSchema);

module.exports = Type;
