const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: String,
        slug: { type: String, unique: true },
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
        description: String,
        tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tag' }],
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
    },
    {
        timestamps: true, // Thêm createdAt và updatedAt
    },
);

tourSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
