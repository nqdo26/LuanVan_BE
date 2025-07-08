const Destination = require('../models/destination');
const slugify = require('slugify');

const createDestination = async (data, files) => {
    // Kiểm tra trùng title (slug)
    if (data.title) {
        const slug = slugify(data.title, { lower: true });
        const existed = await Destination.findOne({ slug });
        if (existed) {
            return { EC: 1, EM: 'Tên địa điểm đã tồn tại. Vui lòng chọn tên khác.' };
        }
        data.slug = slug;
    }

    data.album = {
        space: files && files.space ? files.space.map((f) => f.path) : [],
        fnb: files && files.fnb ? files.fnb.map((f) => f.path) : [],
        extra: files && files.extra ? files.extra.map((f) => f.path) : [],
        highlight: files && files.highlight ? files.highlight.map((f) => f.path) : [],
    };

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

    const defaultOpenHour = {
        mon: { open: '', close: '' },
        tue: { open: '', close: '' },
        wed: { open: '', close: '' },
        thu: { open: '', close: '' },
        fri: { open: '', close: '' },
        sat: { open: '', close: '' },
        sun: { open: '', close: '' },
        allday: false,
    };
    if (!data.openHour) {
        data.openHour = defaultOpenHour;
    } else if (typeof data.openHour === 'string') {
        try {
            data.openHour = JSON.parse(data.openHour);
        } catch {
            data.openHour = defaultOpenHour;
        }
    } else if (typeof data.openHour === 'object') {
        data.openHour = { ...defaultOpenHour, ...data.openHour };
        Object.keys(defaultOpenHour).forEach((key) => {
            if (key === 'allday') return;
            if (typeof data.openHour[key] !== 'object') {
                data.openHour[key] = { open: '', close: '' };
            } else {
                data.openHour[key] = {
                    open: data.openHour[key].open || '',
                    close: data.openHour[key].close || '',
                };
            }
        });
        if (typeof data.openHour.allday === 'boolean') {
            data.openHour.allday = data.openHour.allday;
        } else {
            data.openHour.allday = false;
        }
    }

    if (!data.contactInfo) {
        data.contactInfo = { phone: '', website: '', facebook: '', instagram: '' };
    } else if (typeof data.contactInfo === 'string') {
        try {
            data.contactInfo = JSON.parse(data.contactInfo);
        } catch {}
    }

    data.location = {
        address: data.address,
        city: data.city,
    };

    if (data.createdBy) {
        data.createdBy = data.createdBy;
    }

    const destination = new Destination(data);
    await destination.save();
    return { EC: 0, EM: 'Tạo địa điểm thành công', data: destination };
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
