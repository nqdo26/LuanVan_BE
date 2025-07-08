const Destination = require('../models/destination');
const slugify = require('slugify');

const createDestination = async (data, files) => {
    // Album: nhận từng trường riêng biệt nếu có
    data.album = {
        space: files && files.space ? files.space.map((f) => f.path) : [],
        fnb: files && files.fnb ? files.fnb.map((f) => f.path) : [],
        extra: files && files.extra ? files.extra.map((f) => f.path) : [],
        highlight: files && files.highlight ? files.highlight.map((f) => f.path) : [],
    };

    // details
    // Ưu tiên lấy newHighlight, newServices, newUsefulInfo nếu có, nếu không thì lấy highlight, services, usefulInfo
    data.details = {
        description: data.description,
        highlight: data.newHighlight && data.newHighlight.length > 0 ? [data.newHighlight] : data.highlight || [],
        services: data.newServices && data.newServices.length > 0 ? [data.newServices] : data.services || [],
        cultureType:
            data.newCultureType && data.newCultureType.length > 0 ? [data.newCultureType] : data.cultureType || [],
        activities: data.newActivities && data.newActivities.length > 0 ? [data.newActivities] : data.activities || [],
        fee: data.newFee && data.newFee.length > 0 ? [data.newFee] : data.fee || [],
        usefulInfo: data.newUsefulInfo && data.newUsefulInfo.length > 0 ? [data.newUsefulInfo] : data.usefulInfo || [],
    };

    // openHour
    if (data.openHour) {
        try {
            if (typeof data.openHour === 'string') {
                data.openHour = JSON.parse(data.openHour);
            }
        } catch {}
    }

    // location
    data.location = {
        address: data.address,
        city: data.city,
    };

    if (!data.slug && data.title) {
        data.slug = slugify(data.title, { lower: true });
    }
    const destination = new Destination(data);
    await destination.save();
    return destination;
};

const getDestinations = async () => {
    return await Destination.find().populate('tags').populate('location.city');
};

const getDestinationById = async (id) => {
    return await Destination.findById(id).populate('tags').populate('location.city');
};

const getDestinationBySlug = async (slug) => {
    return await Destination.findOne({ slug }).populate('tags').populate('location.city');
};

const updateDestination = async (id, data, files) => {
    if (files && files.length > 0) {
        data.album = { highlight: files.map((f) => f.path) };
    }
    return await Destination.findByIdAndUpdate(id, data, { new: true });
};

const deleteDestination = async (id) => {
    return await Destination.findByIdAndDelete(id);
};

module.exports = {
    createDestination,
    getDestinations,
    getDestinationById,
    getDestinationBySlug,
    updateDestination,
    deleteDestination,
};
