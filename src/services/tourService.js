const Tour = require('../models/tour');
const slugify = require('slugify');

// Tạo tour mới
const createTourService = async (tourData) => {
    try {
        // Tạo slug từ name
        if (tourData.name) {
            tourData.slug = slugify(tourData.name, { lower: true, strict: true });
        }

        const tour = new Tour(tourData);
        await tour.save();

        // Populate city và destination thông tin
        await tour.populate([
            { path: 'city', select: 'name slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images' },
        ]);

        return {
            EC: 0,
            EM: 'Tạo tour thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in createTourService:', error);
        if (error.code === 11000) {
            return {
                EC: 1,
                EM: 'Tên tour đã tồn tại',
                DT: null,
            };
        }
        return {
            EC: 1,
            EM: 'Lỗi tạo tour',
            DT: null,
        };
    }
};

// Lấy danh sách tour
const getToursService = async (page = 1, limit = 10, search = '', cityId = '') => {
    try {
        const skip = (page - 1) * limit;

        // Tạo filter
        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (cityId) {
            filter.city = cityId;
        }

        const tours = await Tour.find(filter)
            .populate([
                { path: 'city', select: 'name slug' },
                { path: 'itinerary.descriptions.destinationId', select: 'name slug images' },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Tour.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        return {
            EC: 0,
            EM: 'Lấy danh sách tour thành công',
            DT: {
                tours,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    limit: parseInt(limit),
                },
            },
        };
    } catch (error) {
        console.log('Error in getToursService:', error);
        return {
            EC: 1,
            EM: 'Lỗi lấy danh sách tour',
            DT: null,
        };
    }
};

// Lấy tour theo slug
const getTourBySlugService = async (slug) => {
    try {
        const tour = await Tour.findOne({ slug }).populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
        ]);

        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: 'Lấy thông tin tour thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in getTourBySlugService:', error);
        return {
            EC: 1,
            EM: 'Lỗi lấy thông tin tour',
            DT: null,
        };
    }
};

// Lấy tour theo ID
const getTourByIdService = async (id) => {
    try {
        const tour = await Tour.findById(id).populate([
            { path: 'city', select: 'name slug images description' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
        ]);

        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: 'Lấy thông tin tour thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in getTourByIdService:', error);
        return {
            EC: 1,
            EM: 'Lỗi lấy thông tin tour',
            DT: null,
        };
    }
};

// Cập nhật tour
const updateTourService = async (id, updateData) => {
    try {
        // Tạo slug mới nếu name thay đổi
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });
        }

        const tour = await Tour.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
        ]);

        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: 'Cập nhật tour thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in updateTourService:', error);
        if (error.code === 11000) {
            return {
                EC: 1,
                EM: 'Tên tour đã tồn tại',
                DT: null,
            };
        }
        return {
            EC: 1,
            EM: 'Lỗi cập nhật tour',
            DT: null,
        };
    }
};

// Xóa tour
const deleteTourService = async (id) => {
    try {
        const tour = await Tour.findByIdAndDelete(id);

        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: 'Xóa tour thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in deleteTourService:', error);
        return {
            EC: 1,
            EM: 'Lỗi xóa tour',
            DT: null,
        };
    }
};

// Lấy tour công khai
const getPublicToursService = async (page = 1, limit = 10, cityId = '') => {
    try {
        const skip = (page - 1) * limit;

        let filter = { isPublic: true };
        if (cityId) {
            filter.city = cityId;
        }

        const tours = await Tour.find(filter)
            .populate([
                { path: 'city', select: 'name slug images' },
                { path: 'itinerary.descriptions.destinationId', select: 'name slug images rating' },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Tour.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        return {
            EC: 0,
            EM: 'Lấy danh sách tour công khai thành công',
            DT: {
                tours,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    limit: parseInt(limit),
                },
            },
        };
    } catch (error) {
        console.log('Error in getPublicToursService:', error);
        return {
            EC: 1,
            EM: 'Lỗi lấy danh sách tour công khai',
            DT: null,
        };
    }
};

// Legacy functions để tương thích ngược
async function createTour(data) {
    const result = await createTourService(data);
    return result.DT;
}

async function updateTour(id, data) {
    const result = await updateTourService(id, data);
    return result.DT;
}

async function deleteTour(id) {
    const result = await deleteTourService(id);
    return result.DT;
}

async function getTours(filter = {}) {
    return await Tour.find(filter).populate('city').exec();
}

async function getTourBySlug(slug) {
    return await Tour.findOne({ slug }).populate('city').exec();
}

module.exports = {
    createTourService,
    getToursService,
    getTourBySlugService,
    getTourByIdService,
    updateTourService,
    deleteTourService,
    getPublicToursService,
    createTour,
    updateTour,
    deleteTour,
    getTours,
    getTourBySlug,
};
