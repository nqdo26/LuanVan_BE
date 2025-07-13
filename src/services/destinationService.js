const Destination = require('../models/destination');
const slugify = require('slugify');

const createDestination = async (data, files) => {
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

    if (typeof data.openHour === 'string') {
        try {
            data.openHour = JSON.parse(data.openHour);
        } catch (err) {
            data.openHour = {};
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
    const currentDestination = await Destination.findById(id);
    if (!currentDestination) {
        throw new Error('Destination not found');
    }

    const updateData = {};

    if (files && typeof files === 'object') {
        let hasAlbumUpdate = false;

        const processAlbumField = (fieldName, albumKey, existingKey) => {
            let finalImages = [];

            if (data[existingKey]) {
                try {
                    const existingImages = JSON.parse(data[existingKey]);
                    finalImages = [...existingImages];
                } catch (e) {
                    finalImages = [];
                }
            }

            if (files[fieldName] && files[fieldName].length > 0) {
                const newImages = files[fieldName].map((file) => file.path);
                finalImages = [...finalImages, ...newImages];
            }

            if (finalImages.length > 0 || data[existingKey]) {
                if (!updateData.album) updateData.album = { ...currentDestination.album };
                updateData.album[albumKey] = finalImages;
                hasAlbumUpdate = true;
            }
        };

        processAlbumField('album_space', 'space', 'existing_album_space');
        processAlbumField('album_fnb', 'fnb', 'existing_album_fnb');
        processAlbumField('album_extra', 'extra', 'existing_album_extra');
        processAlbumField('images', 'highlight', 'existing_images');
    }

    if (data.address || data.city) {
        updateData.location = {
            address: data.address || currentDestination.location?.address || '',
            city: data.city || currentDestination.location?.city || '',
        };
    }

    if (data.openHour) {
        if (typeof data.openHour === 'string') {
            try {
                data.openHour = JSON.parse(data.openHour);
            } catch (err) {
                data.openHour = currentDestination.openHour;
            }
        }

        if (data.openHour && typeof data.openHour === 'object') {
            const dayMapping = {
                monday: 'mon',
                tuesday: 'tue',
                wednesday: 'wed',
                thursday: 'thu',
                friday: 'fri',
                saturday: 'sat',
                sunday: 'sun',
            };

            const mappedOpenHour = {};

            Object.keys(data.openHour).forEach((key) => {
                if (dayMapping[key]) {
                    mappedOpenHour[dayMapping[key]] = data.openHour[key];
                } else if (key === 'allday') {
                    mappedOpenHour[key] = data.openHour[key];
                } else if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(key)) {
                    mappedOpenHour[key] = data.openHour[key];
                }
            });

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

            updateData.openHour = { ...defaultOpenHour, ...currentDestination.openHour, ...mappedOpenHour };
        }
    }

    if (data.contactInfo) {
        if (typeof data.contactInfo === 'string') {
            try {
                updateData.contactInfo = JSON.parse(data.contactInfo);
            } catch (err) {
                updateData.contactInfo = data.contactInfo;
            }
        } else {
            updateData.contactInfo = data.contactInfo;
        }
    }

    if (data.details) {
        if (typeof data.details === 'string') {
            try {
                updateData.details = JSON.parse(data.details);
            } catch (err) {
                updateData.details = data.details;
            }
        } else {
            updateData.details = data.details;
        }
    }

    if (data.createdBy && data.createdBy !== currentDestination.createdBy) {
        if (!currentDestination.createdBy) {
            updateData.createdBy = data.createdBy;
        }
    }

    const {
        createdBy,
        openHour,
        contactInfo,
        details,
        album,
        address,
        city,
        album_space,
        album_fnb,
        album_extra,
        existing_album_space,
        existing_album_fnb,
        existing_album_extra,
        existing_images,
        ...otherData
    } = data;
    Object.assign(updateData, otherData);

    updateData.updatedAt = new Date();

    const updatedDestination = await Destination.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
            new: true,
            runValidators: true,
        },
    )
        .populate('tags')
        .populate('location.city');

    return updatedDestination;
};

const deleteDestination = async (id) => {
    return await Destination.findByIdAndDelete(id);
};

const getPopularDestinations = async () => {
    return await Destination.find()
        .populate('tags')
        .populate('location.city')
        .sort({ 'statistics.views': -1 })
        .limit(15);
};

const getDestinationsByTags = async (tagIds, cityId = null, limit = 20) => {
    try {
        let filter = {
            tags: { $in: tagIds },
        };

        // Nếu có cityId thì filter theo city
        if (cityId) {
            filter['location.city'] = cityId;
        }

        const destinations = await Destination.find(filter)
            .populate([
                { path: 'tags', select: 'title slug' },
                { path: 'location.city', select: 'name slug images' },
            ])
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return {
            EC: 0,
            EM: 'Lấy danh sách địa điểm theo tags thành công',
            data: destinations,
        };
    } catch (error) {
        console.error('Error in getDestinationsByTags service:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi lấy danh sách địa điểm theo tags',
            data: null,
        };
    }
};

const searchDestinations = async (query, options = {}) => {
    try {
        const { limit = 10, skip = 0 } = options;

        // Create search filter
        const searchFilter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { 'details.description': { $regex: query, $options: 'i' } },
                { 'location.address': { $regex: query, $options: 'i' } },
            ],
        };

        const destinations = await Destination.find(searchFilter)
            .populate('tags', 'title')
            .populate('location.city', 'name slug')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ title: 1 });

        return {
            EC: 0,
            EM: 'Tìm kiếm địa điểm thành công',
            data: destinations,
        };
    } catch (error) {
        console.error('Error in searchDestinations service:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi tìm kiếm địa điểm',
            data: null,
        };
    }
};

const incrementDestinationViews = async (destinationId) => {
    try {
        const destination = await Destination.findByIdAndUpdate(
            destinationId,
            {
                $inc: { 'statistics.views': 1 },
            },
            {
                new: true,
                runValidators: false,
            },
        );

        if (!destination) {
            return {
                EC: 1,
                EM: 'Không tìm thấy địa điểm',
                data: null,
            };
        }

        return {
            EC: 0,
            EM: 'Tăng lượt xem thành công',
            data: destination.statistics.views,
        };
    } catch (error) {
        console.error('Error in incrementDestinationViews service:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi tăng lượt xem',
            data: null,
        };
    }
};

module.exports = {
    createDestination,
    getDestinations,
    searchDestinations,
    getDestinationById,
    getDestinationBySlug,
    updateDestination,
    deleteDestination,
    getPopularDestinations,
    getDestinationsByTags,
    incrementDestinationViews,
};
