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
                items: [
                    {
                        type: { type: String, enum: ['destination', 'note'], required: true },
                        destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'destination' },
                        title: String, // For notes
                        content: String, // Note content or destination note
                        time: String,
                        iconType: { type: String, enum: ['place', 'restaurant', 'coffee'], default: 'place' }, // Store selected icon type
                        order: { type: Number, default: 0 },
                        createdAt: { type: Date, default: Date.now },
                    },
                ],
                // Keep old structure for backward compatibility
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
