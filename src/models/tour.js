const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
    duration: {
        starDay: Date,
        endDay: Date,
        numDays: Number,
    },

    isPublic: {
        type: Boolean,
        default: false,
    },
    itinerary: [
        {
            day: String,
            descriptions: [
                {
                    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'destination' },
                    note: String,
                    time: String,
                },
            ],
            notes: [
                {
                    title: String,
                    content: String,
                },
            ],
        },
    ],
});

tourSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.title, { lower: true });
    }
    next();
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
