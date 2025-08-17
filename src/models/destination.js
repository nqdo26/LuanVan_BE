const mongoose = require('mongoose');
const slugify = require('slugify');

const destinationSchema = new mongoose.Schema({
    title: String,
    slug: String,
    type: String,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tag' }],
    location: {
        address: String,
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
    },
    album: {
        highlight: [String],
        space: [String],
        fnb: [String],
        extra: [String],
    },
    statistics: {
        views: { type: Number, default: 0 },
        totalRate: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
    },
    details: {
        description: { type: String, default: '' },
        highlight: { type: [String], default: [] },
        services: { type: [String], default: [] },
        cultureType: { type: [String], default: [] },
        activities: { type: [String], default: [] },
        fee: { type: [String], default: [] },
        usefulInfo: { type: [String], default: [] },
    },
    openHour: {
        mon: { open: String, close: String },
        tue: { open: String, close: String },
        wed: { open: String, close: String },
        thu: { open: String, close: String },
        fri: { open: String, close: String },
        sat: { open: String, close: String },
        sun: { open: String, close: String },
        allday: Boolean,
    },
    contactInfo: {
        phone: { type: String, default: '' },
        website: { type: String, default: '' },
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String },
});

destinationSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.title, { lower: true });
    }
    this.updatedAt = new Date();
    next();
});

destinationSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Destination = mongoose.model('destination', destinationSchema);

module.exports = Destination;
