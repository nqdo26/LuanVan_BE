const {
    createCityService,
    getCitiesService,
    getCityByIdService,
    getCityByIdAndUpdateService,
    updateCityService,
    deleteCityService,
    getCityBySlugService,
} = require('../services/cityService');

const createCity = async (req, res) => {
    try {
        let body = { ...req.body };
        // Lấy email người tạo từ req.user nếu có
        if (req.user && req.user.email) {
            body.createdBy = req.user.email;
        } else if (body.createdBy) {
            body.createdBy = body.createdBy;
        }
        const result = await createCityService(body, req.files || [], body.createdBy);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

const getCities = async (req, res) => {
    try {
        const result = await getCitiesService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

const getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getCityByIdService(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

const getCityBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await getCityBySlugService(slug);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};
const getCityByIdAndUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        let body = req.body ? { ...req.body } : null;
        // Lấy email người cập nhật từ req.user nếu có
        if (body && req.user && req.user.email) {
            body.createdBy = req.user.email;
        }
        const isUpdateRequest = req.method === 'PUT' || (body && Object.keys(body).length > 0);
        const result = await getCityByIdAndUpdateService(
            id,
            isUpdateRequest ? body : null,
            req.files || [],
            body && body.createdBy ? body.createdBy : null,
        );
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        let body = { ...req.body };
        // Lấy email người cập nhật từ req.user nếu có
        if (req.user && req.user.email) {
            body.createdBy = req.user.email;
        }
        const result = await updateCityService(id, body, req.files || [], body.createdBy);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteCityService(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

module.exports = {
    createCity,
    getCities,
    getCityById,
    getCityBySlug,
    getCityByIdAndUpdate,
    updateCity,
    deleteCity,
};
