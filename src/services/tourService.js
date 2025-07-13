const Tour = require('../models/tour');
const slugify = require('slugify');

const createTourService = async (tourData) => {
    try {
        if (tourData.name) {
            tourData.slug = slugify(tourData.name, { lower: true, strict: true });
        }

        const tour = new Tour(tourData);
        await tour.save();

        await tour.populate([
            { path: 'city', select: 'name slug' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images' },
        ]);

        return {
            EC: 0,
            EM: 'Tạo tour thành công',
            DT: tour,
        };
    } catch (error) {
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

const getToursService = async (page = 1, limit = 10, search = '', cityId = '') => {
    try {
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (cityId) {
            filter.city = cityId;
        }

        const tours = await Tour.find(filter)
            .populate([
                { path: 'city', select: 'name slug images description' },
                { path: 'tags', select: 'title slug' },
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

const getTourBySlugService = async (slug) => {
    try {
        const tour = await Tour.findOne({ slug }).populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
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

const getTourByIdService = async (id) => {
    try {
        const tour = await Tour.findById(id).populate([
            { path: 'city', select: 'name slug images description' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
            {
                path: 'itinerary.items.destinationId',
                select: 'title slug album location tags type statistics',
                populate: {
                    path: 'tags',
                    select: 'title slug',
                },
            },
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

const updateTourService = async (id, updateData) => {
    try {
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });
        }

        const tour = await Tour.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
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

const addDestinationToTourService = async (tourId, dayId, destinationData) => {
    try {
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        let dayIndex = tour.itinerary.findIndex((item) => item.day === dayId);

        if (dayIndex === -1) {
            tour.itinerary.push({
                day: dayId,
                items: [],
                descriptions: [],
                notes: [],
            });
            dayIndex = tour.itinerary.length - 1;
        }

        if (!tour.itinerary[dayIndex].items) {
            tour.itinerary[dayIndex].items = [];
        }

        // Check if destination already exists in this day
        const existingDestination = tour.itinerary[dayIndex].descriptions.find(
            (desc) => desc.destinationId && desc.destinationId.toString() === destinationData.destinationId.toString(),
        );

        if (existingDestination) {
            return {
                EC: 1,
                EM: 'Địa điểm đã tồn tại trong ngày này',
                DT: null,
            };
        }

        const currentItems = tour.itinerary[dayIndex].items || [];
        const nextOrder = currentItems.length > 0 ? Math.max(...currentItems.map((item) => item.order || 0)) + 1 : 0;

        tour.itinerary[dayIndex].items.push({
            type: 'destination',
            destinationId: destinationData.destinationId,
            content: destinationData.note || '',
            time: destinationData.time || '',
            iconType: destinationData.iconType || 'place',
            order: nextOrder,
            createdAt: new Date(),
        });

        tour.itinerary[dayIndex].descriptions.push({
            destinationId: destinationData.destinationId,
            note: destinationData.note || '',
            time: destinationData.time || '',
        });

        await tour.save();

        await tour.populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
            {
                path: 'itinerary.items.destinationId',
                select: 'title slug album location tags type statistics',
                populate: {
                    path: 'tags',
                    select: 'title slug',
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Thêm địa điểm thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in addDestinationToTourService:', error);
        console.log('Error details:', {
            message: error.message,
            stack: error.stack,
            tourId,
            dayId,
            destinationData,
        });
        return {
            EC: 1,
            EM: 'Lỗi khi thêm địa điểm',
            DT: null,
        };
    }
};

const addNoteToTourService = async (tourId, dayId, noteData) => {
    try {
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        let dayIndex = tour.itinerary.findIndex((item) => item.day === dayId);

        if (dayIndex === -1) {
            tour.itinerary.push({
                day: dayId,
                items: [],
                descriptions: [],
                notes: [],
            });
            dayIndex = tour.itinerary.length - 1;
        }

        if (!tour.itinerary[dayIndex].items) {
            tour.itinerary[dayIndex].items = [];
        }

        const currentItems = tour.itinerary[dayIndex].items || [];
        const nextOrder = currentItems.length > 0 ? Math.max(...currentItems.map((item) => item.order || 0)) + 1 : 0;

        tour.itinerary[dayIndex].items.push({
            type: 'note',
            title: noteData.title || 'Ghi chú',
            content: noteData.content || '',
            order: nextOrder,
            createdAt: new Date(),
        });

        tour.itinerary[dayIndex].notes.push({
            title: noteData.title || 'Ghi chú',
            content: noteData.content || '',
        });

        await tour.save();

        await tour.populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
            {
                path: 'itinerary.items.destinationId',
                select: 'title slug album location tags type statistics',
                populate: {
                    path: 'tags',
                    select: 'title slug',
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Thêm ghi chú thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in addNoteToTourService:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi thêm ghi chú',
            DT: null,
        };
    }
};

const updateDestinationInTourService = async (tourId, updateData) => {
    try {
        const { dayId, descriptionIndex, destinationId, itemId } = updateData;

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        const dayIndex = tour.itinerary.findIndex((item) => item.day === dayId);

        if (dayIndex === -1) {
            return {
                EC: 1,
                EM: 'Không tìm thấy ngày trong lịch trình',
                DT: null,
            };
        }

        if (tour.itinerary[dayIndex].items && tour.itinerary[dayIndex].items.length > 0) {
            if (!itemId) {
                return {
                    EC: 1,
                    EM: 'Thiếu thông tin itemId',
                    DT: null,
                };
            }

            const itemIndex = tour.itinerary[dayIndex].items?.findIndex(
                (item) => item._id?.toString() === itemId.toString(),
            );

            if (itemIndex === -1 || !tour.itinerary[dayIndex].items[itemIndex]) {
                return {
                    EC: 1,
                    EM: 'Không tìm thấy địa điểm trong items',
                    DT: null,
                };
            }

            if (updateData.note !== undefined) {
                tour.itinerary[dayIndex].items[itemIndex].content = updateData.note;
            }
            if (updateData.time !== undefined) {
                tour.itinerary[dayIndex].items[itemIndex].time = updateData.time;
            }
        } else if (descriptionIndex !== -1) {
            if (!tour.itinerary[dayIndex].descriptions || !tour.itinerary[dayIndex].descriptions[descriptionIndex]) {
                return {
                    EC: 1,
                    EM: 'Không tìm thấy địa điểm trong descriptions',
                    DT: null,
                };
            }

            if (updateData.note !== undefined) {
                tour.itinerary[dayIndex].descriptions[descriptionIndex].note = updateData.note;
            }
            if (updateData.time !== undefined) {
                tour.itinerary[dayIndex].descriptions[descriptionIndex].time = updateData.time;
            }
        }

        await tour.save();

        await tour.populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
            {
                path: 'itinerary.items.destinationId',
                select: 'title slug album location tags type statistics',
                populate: {
                    path: 'tags',
                    select: 'title slug',
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Cập nhật địa điểm thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in updateDestinationInTourService:', error);
        console.log('Error details:', {
            message: error.message,
            stack: error.stack,
            tourId,
            updateData,
        });
        return {
            EC: 1,
            EM: 'Lỗi khi cập nhật địa điểm',
            DT: null,
        };
    }
};

const removeDestinationFromTourService = async (tourId, removeData) => {
    try {
        const { dayId, itemId, destinationId } = removeData;

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        const dayIndex = tour.itinerary.findIndex((item) => item.day === dayId);
        if (dayIndex === -1) {
            return {
                EC: 1,
                EM: 'Không tìm thấy ngày trong lịch trình',
                DT: null,
            };
        }

        if (tour.itinerary[dayIndex].items) {
            tour.itinerary[dayIndex].items = tour.itinerary[dayIndex].items.filter(
                (item) =>
                    item._id?.toString() !== itemId?.toString() &&
                    item.destinationId?.toString() !== destinationId?.toString(),
            );
        }

        if (tour.itinerary[dayIndex].descriptions) {
            tour.itinerary[dayIndex].descriptions = tour.itinerary[dayIndex].descriptions.filter(
                (desc) => desc.destinationId?.toString() !== destinationId?.toString(),
            );
        }

        await tour.save();

        await tour.populate([
            { path: 'city', select: 'name slug images description info weather type views' },
            { path: 'tags', select: 'title slug' },
            { path: 'itinerary.descriptions.destinationId', select: 'name slug images description address rating' },
            {
                path: 'itinerary.items.destinationId',
                select: 'title slug album location tags type statistics',
                populate: {
                    path: 'tags',
                    select: 'title slug',
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Xóa địa điểm thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in removeDestinationFromTourService:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi xóa địa điểm',
            DT: null,
        };
    }
};

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
    addDestinationToTourService,
    addNoteToTourService,
    updateDestinationInTourService,
    removeDestinationFromTourService,
};
