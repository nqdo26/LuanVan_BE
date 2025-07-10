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
    // Lấy dữ liệu hiện tại của destination
    const currentDestination = await Destination.findById(id);
    if (!currentDestination) {
        throw new Error('Destination not found');
    }

    // Tạo object để cập nhật, bắt đầu từ dữ liệu hiện tại
    const updateData = {};

    // Xử lý album - kết hợp ảnh cũ còn lại và ảnh mới
    if (files && typeof files === 'object') {
        let hasAlbumUpdate = false;

        // Helper function để xử lý từng loại album
        const processAlbumField = (fieldName, albumKey, existingKey) => {
            let finalImages = [];

            // Lấy ảnh cũ còn lại từ data (nếu có)
            if (data[existingKey]) {
                try {
                    const existingImages = JSON.parse(data[existingKey]);
                    finalImages = [...existingImages];
                } catch (e) {
                    console.error(`Error parsing ${existingKey}:`, e);
                }
            }

            // Thêm ảnh mới được upload
            if (files[fieldName] && files[fieldName].length > 0) {
                const newImages = files[fieldName].map((file) => file.path);
                finalImages = [...finalImages, ...newImages];
            }

            // Cập nhật album nếu có thay đổi
            if (finalImages.length > 0 || data[existingKey]) {
                if (!updateData.album) updateData.album = { ...currentDestination.album };
                updateData.album[albumKey] = finalImages;
                hasAlbumUpdate = true;
            }
        };

        // Xử lý từng loại album
        processAlbumField('album_space', 'space', 'existing_album_space');
        processAlbumField('album_fnb', 'fnb', 'existing_album_fnb');
        processAlbumField('album_extra', 'extra', 'existing_album_extra');
        processAlbumField('images', 'highlight', 'existing_images');

        console.log('Album update data:', updateData.album);
    }

    // Xử lý location - cập nhật address và city
    if (data.address || data.city) {
        updateData.location = {
            address: data.address || currentDestination.location?.address || '',
            city: data.city || currentDestination.location?.city || '',
        };
    }

    // Xử lý openHour - giữ lại dữ liệu cũ nếu không có dữ liệu mới
    if (data.openHour) {
        if (typeof data.openHour === 'string') {
            try {
                data.openHour = JSON.parse(data.openHour);
            } catch (err) {
                console.error('Lỗi khi parse openHour:', err);
                data.openHour = currentDestination.openHour;
            }
        }

        // Mapping từ định dạng FE (monday, tuesday...) sang BE (mon, tue...)
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

            // Chuyển đổi từ định dạng FE sang BE
            Object.keys(data.openHour).forEach((key) => {
                if (dayMapping[key]) {
                    mappedOpenHour[dayMapping[key]] = data.openHour[key];
                } else if (key === 'allday') {
                    mappedOpenHour[key] = data.openHour[key];
                } else if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(key)) {
                    mappedOpenHour[key] = data.openHour[key];
                }
            });

            // Đảm bảo có đầy đủ các ngày
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

    // Xử lý contactInfo - parse từ string nếu cần
    if (data.contactInfo) {
        if (typeof data.contactInfo === 'string') {
            try {
                updateData.contactInfo = JSON.parse(data.contactInfo);
            } catch (err) {
                console.error('Lỗi khi parse contactInfo:', err);
                updateData.contactInfo = data.contactInfo;
            }
        } else {
            updateData.contactInfo = data.contactInfo;
        }
    }

    // Xử lý details - parse từ string nếu cần
    if (data.details) {
        if (typeof data.details === 'string') {
            try {
                updateData.details = JSON.parse(data.details);
            } catch (err) {
                console.error('Lỗi khi parse details:', err);
                updateData.details = data.details;
            }
        } else {
            updateData.details = data.details;
        }
    }

    // Bảo vệ trường createdBy - không cho phép ghi đè
    if (data.createdBy && data.createdBy !== currentDestination.createdBy) {
        // Chỉ cập nhật createdBy nếu trường hiện tại trống hoặc null
        if (!currentDestination.createdBy) {
            updateData.createdBy = data.createdBy;
        }
    }

    // Cập nhật các trường khác (loại bỏ các trường đã xử lý để tránh ghi đè)
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

    // Cập nhật thời gian
    updateData.updatedAt = new Date();

    // Sử dụng $set để chỉ cập nhật các trường được chỉ định
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

module.exports = {
    createDestination,
    getDestinations,
    getDestinationById,
    getDestinationBySlug,
    updateDestination,
    deleteDestination,
};
