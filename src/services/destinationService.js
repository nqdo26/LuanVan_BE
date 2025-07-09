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
        cultureType: data.cultureType || [],
        activities: data.activities || [],
        fee: data.fee || [],
        usefulInfo: data.usefulInfo || [],
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

    // Parse openHour nếu là chuỗi JSON
    if (typeof data.openHour === 'string') {
        try {
            data.openHour = JSON.parse(data.openHour);
        } catch (err) {
            console.error('Lỗi khi parse openHour:', err);
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
    data.album = {
        space: Array.isArray(data.album_space) ? data.album_space : [],
        fnb: Array.isArray(data.album_fnb) ? data.album_fnb : [],
        extra: Array.isArray(data.album_extra) ? data.album_extra : [],
        highlight: data.album?.highlight || [],
    };

    delete data.album_space;
    delete data.album_fnb;
    delete data.album_extra;

    if (files && files.length > 0) {
        const newHighlight = files.map((f) => f.path);
        data.album.highlight = newHighlight;
    }

    data.updatedAt = new Date();
    const updatedDestination = await Destination.findByIdAndUpdate(id, data, {
        new: true,
        overwrite: true,
    });
    return updatedDestination;
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
