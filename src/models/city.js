const mongoose = require('mongoose');
const slugify = require('slugify');

const citySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    description: String,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cityType' }],
    views: { type: Number, default: 0 },
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
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

citySchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const City = mongoose.model('city', citySchema);

module.exports = City;
