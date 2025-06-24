const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'destination' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    detail: {
        landscape: Number,
        service: Number,
        price: Number,
        cleanliness: Number,
        convenience: Number,
        activities: Number,
    },
    createdAt: { type: Date, default: Date.now },
    title: String,
    content: String,
    visitDate: Date,
    images: [String],
    likeCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
