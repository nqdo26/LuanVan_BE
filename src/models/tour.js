const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: String,
        slug: { type: String },
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
        description: String,
        tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tag' }],
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
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
                        title: String,
                        content: String,
                        time: String,
                        iconType: { type: String, enum: ['place', 'restaurant', 'coffee'], default: 'place' },
                        order: { type: Number, default: 0 },
                        createdAt: { type: Date, default: Date.now },
                    },
                ],

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
        timestamps: true,
    },
);

tourSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

// Middleware để thêm tour vào User.tours khi tạo tour mới
tourSchema.post('save', async function (doc, next) {
    try {
        if (doc.userId && doc.isNew !== false) {
            const User = require('./user');
            await User.findByIdAndUpdate(doc.userId, { $addToSet: { tours: doc._id } }, { new: true });
        }
    } catch (error) {
        console.log('Error updating user tours:', error);
    }
    next();
});

// Middleware để xóa tour khỏi User.tours khi xóa tour
tourSchema.post('findOneAndDelete', async function (doc, next) {
    try {
        if (doc && doc.userId) {
            const User = require('./user');
            await User.findByIdAndUpdate(doc.userId, { $pull: { tours: doc._id } }, { new: true });
        }
    } catch (error) {
        console.log('Error removing tour from user:', error);
    }
    next();
});

// Compound index để slug unique trong phạm vi từng user
tourSchema.index({ slug: 1, userId: 1 }, { unique: true });

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
