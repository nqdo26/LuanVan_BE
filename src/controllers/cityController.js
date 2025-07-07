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
        const userId = req.user?.id;
        const result = await createCityService(req.body, req.files || [], userId);
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
        const userId = req.user?.id;

        const isUpdateRequest = req.method === 'PUT' || Object.keys(req.body).length > 0;

        const result = await getCityByIdAndUpdateService(
            id,
            isUpdateRequest ? req.body : null,
            req.files || [],
            userId,
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
        const userId = req.user?.id;
        const result = await updateCityService(id, req.body, req.files || [], userId);
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
