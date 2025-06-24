
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    fullName: String,
    avatar: String,
    isAdmin: {
        type: Boolean,
        default: false,
    },
    favortites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'destination',
        },
    ],
    tours: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tour',
        },
    ],
});

const User = mongoose.model('user', userSchema);

module.exports = User;
