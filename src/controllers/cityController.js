const {
    createCityService,
    getCitiesService,
    getCitiesWithDestinationCountService,
    getCityByIdService,
    getCityByIdAndUpdateService,
    updateCityService,
    getCityDeletionInfoService,
    deleteCityService,
    getCityBySlugService,
} = require('../services/cityService');

const createCity = async (req, res) => {
    try {
        let body = { ...req.body };
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

const getCitiesWithDestinationCount = async (req, res) => {
    try {
        const result = await getCitiesWithDestinationCountService();
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

        if (body) {
            ['weather', 'info', 'type'].forEach((key) => {
                if (typeof body[key] === 'string') {
                    try {
                        body[key] = JSON.parse(body[key]);
                    } catch {}
                }
            });

            if (body.existing_images && typeof body.existing_images === 'string') {
                try {
                    body.existing_images = JSON.parse(body.existing_images);
                } catch {}
            }
        }

        const isUpdateRequest = req.method === 'PUT' || req.method === 'PATCH';

        if (isUpdateRequest && body && req.user && req.user.email) {
            body.createdBy = req.user.email;
        }

        const result = await getCityByIdAndUpdateService(
            id,
            isUpdateRequest ? body : null,
            req.files || [],
            isUpdateRequest && body && body.createdBy ? body.createdBy : null,
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

        ['weather', 'info', 'type'].forEach((key) => {
            if (typeof body[key] === 'string') {
                try {
                    body[key] = JSON.parse(body[key]);
                } catch {}
            }
        });

        if (body.existing_images && typeof body.existing_images === 'string') {
            try {
                body.existing_images = JSON.parse(body.existing_images);
            } catch {}
        }

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

const getCityDeletionInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getCityDeletionInfoService(id);
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
    getCitiesWithDestinationCount,
    getCityById,
    getCityBySlug,
    getCityByIdAndUpdate,
    updateCity,
    deleteCity,
    getCityDeletionInfo,
};
