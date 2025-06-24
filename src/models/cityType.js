const mongoose = require('mongoose');

const cityTypeSchema = new mongoose.Schema({
    title: String,
});

const CityType = mongoose.model('cityType', cityTypeSchema);

module.exports = CityType;
