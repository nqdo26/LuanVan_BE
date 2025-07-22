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
    incrementCityViews,
    getCityByTypeService,
} = require('../services/cityService');

const getCityByType = async (req, res) => {
    try {
        const typeSlug = req.params.type;

        let typeName = typeSlug;
        if (typeSlug === 'bien') typeName = 'Biển';
        if (typeSlug === 'nui') typeName = 'Núi';
        if (typeSlug === 'van-hoa') typeName = 'Văn hóa';

        const cities = await getCityByTypeService(typeName);
        res.status(200).json({ EC: 0, data: cities });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: err.message });
    }
};

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

        if (isUpdateRequest && body) {
            let existingImages = Array.isArray(body.existing_images) ? body.existing_images : [];

            let newImages = (req.files || []).map((f) => f.path);
            body.images = [...existingImages, ...newImages];
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

const incrementCityViewsController = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');

        // Validate city ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                EC: 1,
                EM: 'ID thành phố không hợp lệ',
                data: null,
            });
        }

        const result = await incrementCityViews(id);

        if (result.EC === 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error in incrementCityViewsController:', error);
        res.status(500).json({
            EC: 1,
            EM: 'Lỗi server khi tăng lượt xem',
            data: null,
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
    incrementCityViewsController,
    getCityByType,
};
