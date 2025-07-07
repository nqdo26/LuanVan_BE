const mongoose = require('mongoose');

const destinationTypeSchema = new mongoose.Schema({
    title: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const DestinationType = mongoose.model('destinationType', destinationTypeSchema);

module.exports = DestinationType;
