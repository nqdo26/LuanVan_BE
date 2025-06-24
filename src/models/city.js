const { details, title } = require('framer-motion/client');
const mongoose = require('mongoose');
const slugify = require('slugify');

const citySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    description: String,
    aiDescription: String,
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'cityType' },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 4;
            },
        },
    },
    weather: [
        {
            title: String,
            minTemp: Number,
            maxTemp: Number,
            note: String,
        },
    ],
    info: [
        {
            title: String,
            description: String,
        },
    ],
});

citySchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.title, { lower: true });
    }
    next();
});

const City = mongoose.model('city', citySchema);

module.exports = City;
