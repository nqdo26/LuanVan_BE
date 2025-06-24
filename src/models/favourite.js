const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'document' }],
    total: Number,
});

const Favourite = mongoose.model('favourite', favouriteSchema);

module.exports = Favourite;
