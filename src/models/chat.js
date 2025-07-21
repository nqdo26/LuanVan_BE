const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    title: {
        type: String,
        index: true,
    },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            city: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

chatSchema.index({
    title: 'text',
});

const Chat = mongoose.model('chat', chatSchema);
module.exports = Chat;
