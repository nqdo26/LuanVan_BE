const {
    createTourService,
    getToursService,
    getTourBySlugService,
    getTourByIdService,
    updateTourService,
    deleteTourService,
    getPublicToursService,
} = require('../services/tourService');

// Tạo tour mới
const createTour = async (req, res) => {
    try {
        const result = await createTourService(req.body);

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

// Lấy danh sách tour
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

// Lấy tour theo slug
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

// Lấy tour theo ID
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

// Cập nhật tour
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

// Xóa tour
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

// Lấy tour công khai (không cần auth)
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

module.exports = {
    createTour,
    getTours,
    getTourBySlug,
    getTourById,
    updateTour,
    deleteTour,
    getPublicTours,
};
