const {
    createTourService,
    getToursService,
    getTourBySlugService,
    getTourByIdService,
    updateTourService,
    deleteTourService,
    getPublicToursService,
    getToursByUserIdService,
    addDestinationToTourService,
    addNoteToTourService,
    updateDestinationInTourService,
    removeDestinationFromTourService,
    removeNoteFromTourService,
} = require('../services/tourService');

const createTour = async (req, res) => {
    try {
        // Thêm userId từ token vào dữ liệu tour
        const tourData = {
            ...req.body,
            userId: req.user.id,
        };

        const result = await createTourService(tourData);

        return res.status(result.EC === 0 ? 201 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in createTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const getTours = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', cityId = '' } = req.query;

        const result = await getToursService(page, limit, search, cityId);

        return res.status(200).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in getTours controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const getTourBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const result = await getTourBySlugService(slug);

        return res.status(result.EC === 0 ? 200 : 404).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in getTourBySlug controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const getTourById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await getTourByIdService(id);

        return res.status(result.EC === 0 ? 200 : 404).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in getTourById controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const updateTour = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await updateTourService(id, req.body);

        return res.status(result.EC === 0 ? 200 : 404).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in updateTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await deleteTourService(id);

        return res.status(result.EC === 0 ? 200 : 404).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in deleteTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const getPublicTours = async (req, res) => {
    try {
        const { page = 1, limit = 10, cityId = '' } = req.query;

        const result = await getPublicToursService(page, limit, cityId);

        return res.status(200).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in getPublicTours controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const addDestinationToTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { dayId, destinationId, note, time } = req.body;

        if (!dayId || !destinationId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ngày hoặc địa điểm',
                DT: null,
            });
        }

        const result = await addDestinationToTourService(tourId, dayId, {
            destinationId,
            note,
            time,
        });

        return res.status(result.EC === 0 ? 200 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in addDestinationToTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const addNoteToTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { dayId, title, content } = req.body;

        if (!dayId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ngày',
                DT: null,
            });
        }

        const result = await addNoteToTourService(tourId, dayId, {
            title: title || 'Ghi chú',
            content: content || '',
        });

        return res.status(result.EC === 0 ? 200 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in addNoteToTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const updateDestinationInTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { dayId, descriptionIndex, note, time, destinationId, itemId } = req.body;

        if (!dayId || descriptionIndex === undefined) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ngày hoặc index địa điểm',
                DT: null,
            });
        }

        const result = await updateDestinationInTourService(tourId, {
            dayId,
            descriptionIndex,
            note,
            time,
            destinationId,
            itemId,
        });

        return res.status(result.EC === 0 ? 200 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const removeDestinationFromTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { dayId, itemId, destinationId } = req.body;

        if (!dayId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ngày',
                DT: null,
            });
        }

        if (!itemId && !destinationId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin địa điểm cần xóa',
                DT: null,
            });
        }

        const result = await removeDestinationFromTourService(tourId, {
            dayId,
            itemId,
            destinationId,
        });

        return res.status(result.EC === 0 ? 200 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in removeDestinationFromTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const removeNoteFromTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { dayId, noteIndex } = req.body;

        if (!dayId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ngày',
                DT: null,
            });
        }

        if (noteIndex === undefined || noteIndex === null) {
            return res.status(400).json({
                EC: 1,
                EM: 'Thiếu thông tin ghi chú cần xóa',
                DT: null,
            });
        }

        const result = await removeNoteFromTourService(tourId, {
            dayId,
            noteIndex,
        });

        return res.status(result.EC === 0 ? 200 : 400).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in removeNoteFromTour controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

const getUserTours = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const result = await getToursByUserIdService(userId, page, limit);

        return res.status(200).json({
            EC: result.EC,
            EM: result.EM,
            DT: result.DT,
        });
    } catch (error) {
        console.log('Error in getUserTours controller:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server',
            DT: null,
        });
    }
};

module.exports = {
    createTour,
    getTours,
    getTourBySlug,
    getTourById,
    updateTour,
    deleteTour,
    getPublicTours,
    addDestinationToTour,
    addNoteToTour,
    updateDestinationInTour,
    removeDestinationFromTour,
    removeNoteFromTour,
    getUserTours,
};
