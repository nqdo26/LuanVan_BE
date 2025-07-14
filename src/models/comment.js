const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'destination' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    detail: {
        criteria1: Number, 
        criteria2: Number, 
        criteria3: Number, 
        criteria4: Number, 
        criteria5: Number, 
        criteria6: Number, 
    },
    createdAt: { type: Date, default: Date.now },
    title: String,
    content: String,
    visitDate: Date,
    images: [String],
    likeCount: { type: Number, default: 0 },
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
