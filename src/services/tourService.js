const Tour = require('../models/tour');
const slugify = require('slugify');

const createTourService = async (tourData) => {
    try {
        if (tourData.name) {
            tourData.slug = slugify(tourData.name, { lower: true, strict: true });
        }

        // Kiểm tra slug đã tồn tại trong tours của user này chưa
        if (tourData.userId && tourData.slug) {
            const existingTour = await Tour.findOne({
                slug: tourData.slug,
                userId: tourData.userId,
            });

            if (existingTour) {
                return {
                    EC: 1,
                    EM: 'Bạn đã có tour với tên này rồi',
                    DT: null,
                };
            }
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
                EM: 'Bạn đã có tour với tên này rồi',
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
            { path: 'userId', select: 'email username fullname' },
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
        // Update slug if name is changed
        if (updateData.name) {
            const newSlug = slugify(updateData.name, { lower: true, strict: true });

            // Get current tour to check userId
            const currentTour = await Tour.findById(id);
            if (!currentTour) {
                return {
                    EC: 1,
                    EM: 'Không tìm thấy tour',
                    DT: null,
                };
            }

            // Check if slug already exists for this user (except for current tour)
            const existingSlugTour = await Tour.findOne({
                slug: newSlug,
                userId: currentTour.userId,
                _id: { $ne: id },
            });

            if (existingSlugTour) {
                return {
                    EC: 1,
                    EM: 'Bạn đã có tour với tên này rồi. Vui lòng chọn tên khác.',
                    DT: null,
                };
            }

            updateData.slug = newSlug;
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
                EM: 'Bạn đã có tour với tên này rồi',
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

const removeNoteFromTourService = async (tourId, removeData) => {
    try {
        const { dayId, noteIndex } = removeData;

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return {
                EC: 1,
                EM: 'Không tìm thấy tour',
                DT: null,
            };
        }

        const dayData = tour.itinerary.find((item) => item.day === dayId);
        if (!dayData) {
            return {
                EC: 1,
                EM: 'Không tìm thấy ngày trong lịch trình',
                DT: null,
            };
        }

        // Xóa từ items array (structure mới)
        if (dayData.items && dayData.items.length > 0) {
            const noteItems = dayData.items.filter((item) => item.type === 'note');

            if (noteIndex >= 0 && noteIndex < noteItems.length) {
                const targetNoteItem = noteItems[noteIndex];
                const itemIndex = dayData.items.findIndex((item) => item === targetNoteItem);

                if (itemIndex !== -1) {
                    dayData.items.splice(itemIndex, 1);
                }
            } else {
                console.log('Note index out of bounds:', noteIndex, 'available notes:', noteItems.length);
            }
        }

        if (dayData.notes && noteIndex >= 0 && noteIndex < dayData.notes.length) {
            dayData.notes.splice(noteIndex, 1);
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
            EM: 'Xóa ghi chú thành công',
            DT: tour,
        };
    } catch (error) {
        console.log('Error in removeNoteFromTourService:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi xóa ghi chú',
            DT: null,
        };
    }
};

const getToursByUserIdService = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        const tours = await Tour.find({ userId })
            .populate([
                { path: 'city', select: 'name slug images' },
                { path: 'tags', select: 'title slug' },
                { path: 'itinerary.descriptions.destinationId', select: 'name slug images' },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Tour.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);

        return {
            EC: 0,
            EM: 'Lấy danh sách tour của người dùng thành công',
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
        console.log('Error in getToursByUserIdService:', error);
        return {
            EC: 1,
            EM: 'Lỗi lấy danh sách tour của người dùng',
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

const updateNoteInTourService = async (tourId, { dayId, noteIndex, title, content }) => {
    try {
        const tour = await Tour.findById(tourId);

        if (!tour) {
            return { EC: 1, EM: 'Không tìm thấy tour', DT: null };
        }
        const dayData = tour.itinerary.find((item) => item.day === dayId);
        if (!dayData || !dayData.notes || noteIndex < 0 || noteIndex >= dayData.notes.length) {
            return { EC: 1, EM: 'Không tìm thấy ghi chú', DT: null };
        }

        if (title !== undefined) dayData.notes[noteIndex].title = title;
        if (content !== undefined) dayData.notes[noteIndex].content = content;

        if (Array.isArray(dayData.items)) {
            let noteItemCount = 0;
            for (let i = 0; i < dayData.items.length; i++) {
                const item = dayData.items[i];
                if (item.type === 'note') {
                    if (noteItemCount === noteIndex) {
                        if (title !== undefined) item.title = title;
                        if (content !== undefined) item.content = content;
                        break;
                    }
                    noteItemCount++;
                }
            }
        }

        await tour.save();

        return { EC: 0, EM: 'Cập nhật ghi chú thành công', DT: tour };
    } catch (error) {
        return { EC: 1, EM: 'Lỗi khi cập nhật ghi chú', DT: null };
    }
};

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
    removeNoteFromTourService,
    getToursByUserIdService,
    updateNoteInTourService,
};
